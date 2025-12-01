"""
MemoRAG ULTRA - Test Script
Quick test to verify the system is working
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core import get_config, get_lm_studio_client
from app.db import get_db
from app.rag import (
    get_embedding_generator,
    get_vector_index,
    get_knowledge_graph,
    get_chunker
)


async def test_configuration():
    """Test configuration loading"""
    print("=" * 60)
    print("Testing Configuration...")
    print("=" * 60)
    
    config = get_config()
    print(f"✓ Configuration loaded")
    print(f"  LM Studio URL: {config.lm_studio.base_url}")
    print(f"  Model: {config.lm_studio.model_name}")
    print(f"  Embedding Model: {config.embeddings.model_name}")
    print(f"  Database: {config.database.path}")
    print()


async def test_database():
    """Test database connection"""
    print("=" * 60)
    print("Testing Database...")
    print("=" * 60)
    
    db = get_db()
    
    # Count documents
    docs = db.execute_query("SELECT COUNT(*) as count FROM documents")
    print(f"✓ Database connected")
    print(f"  Documents: {docs[0]['count']}")
    
    chunks = db.execute_query("SELECT COUNT(*) as count FROM chunks")
    print(f"  Chunks: {chunks[0]['count']}")
    
    entities = db.execute_query("SELECT COUNT(*) as count FROM entities")
    print(f"  Entities: {entities[0]['count']}")
    print()


async def test_lm_studio():
    """Test LM Studio connection"""
    print("=" * 60)
    print("Testing LM Studio Connection...")
    print("=" * 60)
    
    client = get_lm_studio_client()
    connected = await client.check_connection()
    
    if connected:
        print(f"✓ LM Studio connected")
        
        # Test generation
        try:
            response = await client.generate(
                "Say 'Hello from MemoRAG ULTRA!' in one sentence.",
                temperature=0.7,
                max_tokens=50
            )
            print(f"✓ Generation test successful")
            print(f"  Response: {response[:100]}")
        except Exception as e:
            print(f"✗ Generation failed: {e}")
    else:
        print(f"✗ LM Studio not connected")
        print(f"  Please start LM Studio server at the configured URL")
    print()


async def test_embeddings():
    """Test embedding generation"""
    print("=" * 60)
    print("Testing Embeddings...")
    print("=" * 60)
    
    try:
        emb_gen = get_embedding_generator()
        
        # Test single embedding
        text = "This is a test sentence for embedding generation."
        embedding = emb_gen.embed_text(text)
        
        print(f"✓ Embedding generation successful")
        print(f"  Dimension: {len(embedding)}")
        print(f"  Sample values: {embedding[:5]}")
        
        # Test batch
        texts = ["First sentence", "Second sentence", "Third sentence"]
        embeddings = emb_gen.embed_batch(texts)
        print(f"✓ Batch embedding successful")
        print(f"  Batch size: {len(embeddings)}")
        
    except Exception as e:
        print(f"✗ Embedding test failed: {e}")
    print()


async def test_chunking():
    """Test text chunking"""
    print("=" * 60)
    print("Testing Text Chunking...")
    print("=" * 60)
    
    chunker = get_chunker()
    
    text = """
    This is a sample document for testing the chunking functionality.
    It contains multiple sentences across several paragraphs.
    
    The chunker should split this text into appropriate chunks
    while maintaining context and overlap between chunks.
    
    This helps ensure that information is not lost at chunk boundaries.
    """
    
    chunks = chunker.chunk_text(text, strategy="fixed")
    
    print(f"✓ Chunking successful")
    print(f"  Chunks created: {len(chunks)}")
    print(f"  First chunk: {chunks[0].content[:100]}...")
    print()


async def test_vector_index():
    """Test vector index"""
    print("=" * 60)
    print("Testing Vector Index...")
    print("=" * 60)
    
    vector_index = get_vector_index()
    stats = vector_index.get_stats()
    
    print(f"✓ Vector index loaded")
    print(f"  Total vectors: {stats['total_vectors']}")
    print(f"  Dimension: {stats['dimension']}")
    print(f"  Index type: {stats['index_type']}")
    
    if stats['total_vectors'] > 0:
        # Test search
        results = vector_index.search("test query", top_k=3)
        print(f"✓ Search successful")
        print(f"  Results: {len(results)}")
    print()


async def test_knowledge_graph():
    """Test knowledge graph"""
    print("=" * 60)
    print("Testing Knowledge Graph...")
    print("=" * 60)
    
    kg = get_knowledge_graph()
    stats = kg.get_stats()
    
    print(f"✓ Knowledge graph loaded")
    print(f"  Nodes: {stats['nodes']}")
    print(f"  Edges: {stats['edges']}")
    print(f"  Density: {stats['density']:.4f}")
    print()


async def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("MemoRAG ULTRA - System Test")
    print("=" * 60 + "\n")
    
    await test_configuration()
    await test_database()
    await test_lm_studio()
    await test_embeddings()
    await test_chunking()
    await test_vector_index()
    await test_knowledge_graph()
    
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    print("All core components tested!")
    print("\nNext steps:")
    print("1. Start the backend: python -m app.main")
    print("2. Test ingestion: POST /api/ingest")
    print("3. Test query: POST /api/query")
    print("4. Check status: GET /api/system/status")
    print()


if __name__ == "__main__":
    asyncio.run(main())
