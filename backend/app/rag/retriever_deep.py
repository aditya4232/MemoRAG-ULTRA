"""
MemoRAG ULTRA - Deep Mode Retriever
Graph-based multi-hop reasoning for complex queries
"""
from typing import List, Dict, Any, Optional, Set
import logging

from app.core.config import get_config
from app.core.lm_studio_client import get_lm_studio_client
from app.rag import get_vector_index, get_knowledge_graph
from app.db import get_db

logger = logging.getLogger(__name__)


class DeepModeRetriever:
    """Deep retrieval using knowledge graph traversal"""
    
    def __init__(self):
        self.config = get_config()
        self.vector_index = get_vector_index()
        self.knowledge_graph = get_knowledge_graph()
        self.llm_client = get_lm_studio_client()
        self.db = get_db()
    
    async def retrieve(
        self,
        query: str,
        top_k: Optional[int] = None,
        max_hops: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Retrieve using graph-based multi-hop reasoning
        
        Args:
            query: User query
            top_k: Number of initial chunks
            max_hops: Maximum graph traversal hops
            
        Returns:
            Dict with chunks, graph paths, and context
        """
        if top_k is None:
            top_k = self.config.rag.top_k_deep
        if max_hops is None:
            max_hops = self.config.knowledge_graph.max_hops
        
        logger.info(f"Deep Mode: Multi-hop retrieval (top_k={top_k}, max_hops={max_hops})")
        
        # Step 1: Initial vector retrieval
        initial_results = self.vector_index.search(query, top_k)
        
        if not initial_results:
            return {
                'chunks': [],
                'graph_paths': [],
                'context': '',
                'metadata': {'mode': 'deep', 'chunks_retrieved': 0}
            }
        
        # Step 2: Extract entities from query
        query_entities = await self._extract_query_entities(query)
        logger.info(f"Extracted {len(query_entities)} entities from query")
        
        # Step 3: Get chunks and their entities
        chunk_ids = [cid for cid, _ in initial_results]
        chunks = []
        all_entities = set()
        
        for chunk_id in chunk_ids:
            chunk_data = self.db.execute_query(
                "SELECT * FROM chunks WHERE chunk_id = ?",
                (chunk_id,)
            )
            if chunk_data:
                chunk = dict(chunk_data[0])
                chunks.append(chunk)
                
                # Get entities associated with this chunk
                entity_data = self.db.execute_query(
                    """
                    SELECT e.entity_id, e.name, e.entity_type 
                    FROM entities e
                    JOIN entity_chunks ec ON e.entity_id = ec.entity_id
                    WHERE ec.chunk_id = ?
                    """,
                    (chunk_id,)
                )
                for entity in entity_data:
                    all_entities.add(entity['name'])
        
        # Step 4: Graph traversal from query entities
        graph_paths = []
        expanded_entities = set()
        
        for entity in query_entities:
            # Find paths in graph
            paths = self.knowledge_graph.find_paths(
                entity,
                max_hops=max_hops
            )
            
            for path in paths:
                graph_paths.append({
                    'entities': path,
                    'length': len(path)
                })
                
                # Collect entities from paths
                for entity_id in path:
                    node = self.knowledge_graph.graph.nodes.get(entity_id, {})
                    if 'name' in node:
                        expanded_entities.add(node['name'])
        
        # Step 5: Retrieve additional chunks for expanded entities
        additional_chunks = await self._get_chunks_for_entities(
            expanded_entities - all_entities
        )
        chunks.extend(additional_chunks)
        
        # Step 6: Get document info
        doc_ids = list(set(c['doc_id'] for c in chunks))
        documents = {}
        for doc_id in doc_ids:
            doc = self.db.get_document(doc_id)
            if doc:
                documents[doc_id] = doc
        
        # Step 7: Assemble context with graph information
        context = await self._assemble_deep_context(
            chunks,
            documents,
            graph_paths,
            query_entities
        )
        
        return {
            'chunks': chunks,
            'documents': documents,
            'graph_paths': graph_paths,
            'query_entities': list(query_entities),
            'expanded_entities': list(expanded_entities),
            'context': context,
            'metadata': {
                'mode': 'deep',
                'chunks_retrieved': len(chunks),
                'documents_used': len(documents),
                'graph_paths_found': len(graph_paths),
                'entities_expanded': len(expanded_entities)
            }
        }
    
    async def _extract_query_entities(self, query: str) -> Set[str]:
        """Extract entities from query using LLM"""
        try:
            result = await self.llm_client.extract_entities(query)
            entities = set()
            for entity in result.get('entities', []):
                entities.add(entity['name'])
            return entities
        except Exception as e:
            logger.warning(f"Entity extraction failed: {e}")
            # Fallback: use query terms as potential entities
            return set(word for word in query.split() if len(word) > 3)
    
    async def _get_chunks_for_entities(
        self,
        entities: Set[str]
    ) -> List[Dict[str, Any]]:
        """Get chunks associated with entities"""
        if not entities:
            return []
        
        chunks = []
        for entity_name in entities:
            entity = self.db.get_entity_by_name(entity_name)
            if not entity:
                continue
            
            # Get chunks for this entity
            chunk_data = self.db.execute_query(
                """
                SELECT c.* FROM chunks c
                JOIN entity_chunks ec ON c.chunk_id = ec.chunk_id
                WHERE ec.entity_id = ?
                LIMIT 2
                """,
                (entity['entity_id'],)
            )
            
            for row in chunk_data:
                chunks.append(dict(row))
        
        return chunks
    
    async def _assemble_deep_context(
        self,
        chunks: List[Dict[str, Any]],
        documents: Dict[str, Any],
        graph_paths: List[Dict[str, Any]],
        query_entities: Set[str]
    ) -> str:
        """Assemble context with graph reasoning information"""
        context_parts = []
        
        # Add query entities
        if query_entities:
            context_parts.append(
                f"Key Entities: {', '.join(query_entities)}"
            )
        
        # Add graph paths
        if graph_paths:
            path_descriptions = []
            for i, path in enumerate(graph_paths[:5], 1):  # Limit to 5 paths
                entity_names = []
                for entity_id in path['entities']:
                    node = self.knowledge_graph.graph.nodes.get(entity_id, {})
                    if 'name' in node:
                        entity_names.append(node['name'])
                
                if entity_names:
                    path_descriptions.append(f"{i}. {' → '.join(entity_names)}")
            
            if path_descriptions:
                context_parts.append(
                    "Knowledge Graph Paths:\n" + "\n".join(path_descriptions)
                )
        
        # Add chunks
        context_parts.append("\nRelevant Information:")
        for chunk in chunks[:10]:  # Limit chunks
            doc = documents.get(chunk['doc_id'], {})
            doc_title = doc.get('title', 'Unknown')
            context_parts.append(
                f"\n[Source: {doc_title}]\n{chunk['content']}"
            )
        
        return "\n\n".join(context_parts)


def get_deep_retriever() -> DeepModeRetriever:
    """Get deep mode retriever instance"""
    return DeepModeRetriever()
