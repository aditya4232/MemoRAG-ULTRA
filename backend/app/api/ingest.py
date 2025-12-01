"""
MemoRAG ULTRA - Document Ingestion API
"""
import uuid
import time
from pathlib import Path
from typing import Optional
import logging

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from app.core.models import IngestRequest, IngestResponse, DocumentType, ProcessingStatus
from app.core.config import get_config
from app.db import get_db
from app.rag import (
    get_document_processor,
    get_chunker,
    get_embedding_generator,
    get_vector_index,
    get_knowledge_graph
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    doc_type: str = Form(...),
    title: Optional[str] = Form(None),
    tags: Optional[str] = Form(None)
):
    """
    Ingest a document into the knowledge base
    
    Supports:
    - File upload (PDF, TXT, MD, DOCX)
    - URL ingestion
    - Raw content
    """
    start_time = time.time()
    
    try:
        # Validate input
        if not any([file, url, content]):
            raise HTTPException(400, "Must provide file, url, or content")
        
        # Generate document ID
        doc_id = str(uuid.uuid4())
        
        # Determine title
        if not title:
            if file:
                title = file.filename
            elif url:
                title = url
            else:
                title = f"Document {doc_id[:8]}"
        
        # Parse tags
        tag_list = []
        if tags:
            tag_list = [t.strip() for t in tags.split(',')]
        
        # Get processors
        doc_processor = get_document_processor()
        chunker = get_chunker()
        embedding_gen = get_embedding_generator()
        vector_index = get_vector_index()
        knowledge_graph = get_knowledge_graph()
        db = get_db()
        
        # Save file if uploaded
        file_path = None
        if file:
            config = get_config()
            upload_dir = Path(config.paths.documents)
            upload_dir.mkdir(parents=True, exist_ok=True)
            
            file_path = upload_dir / f"{doc_id}_{file.filename}"
            with open(file_path, 'wb') as f:
                content_bytes = await file.read()
                f.write(content_bytes)
        
        # Insert document record
        db.insert_document({
            'doc_id': doc_id,
            'title': title,
            'doc_type': doc_type,
            'file_path': str(file_path) if file_path else None,
            'url': url,
            'size_bytes': len(content_bytes) if file else len(content or ''),
            'status': 'processing',
            'tags': tag_list
        })
        
        # Extract text
        logger.info(f"Processing document: {title}")
        
        if file_path:
            extraction = doc_processor.process_file(str(file_path))
        elif url:
            extraction = doc_processor.process_url(url)
        else:
            extraction = doc_processor.process_content(content, doc_type)
        
        text = extraction['text']
        metadata = extraction['metadata']
        
        # Chunk text
        logger.info(f"Chunking document...")
        chunks = chunker.chunk_text(text, strategy="fixed")
        
        logger.info(f"Created {len(chunks)} chunks")
        
        # Generate embeddings and store chunks
        chunk_ids = []
        chunk_texts = []
        chunk_records = []
        
        for chunk in chunks:
            chunk_id = str(uuid.uuid4())
            chunk_ids.append(chunk_id)
            chunk_texts.append(chunk.content)
            
            chunk_records.append({
                'chunk_id': chunk_id,
                'doc_id': doc_id,
                'content': chunk.content,
                'chunk_index': chunk.chunk_index,
                'page_number': chunk.page_number,
                'start_char': chunk.start_char,
                'end_char': chunk.end_char
            })
        
        # Store chunks in database
        db.insert_chunks(chunk_records)
        
        # Add to vector index
        logger.info(f"Adding chunks to vector index...")
        vector_index.add_chunks(chunk_ids, chunk_texts)
        
        # Extract entities and build knowledge graph
        logger.info(f"Extracting entities and building knowledge graph...")
        total_entities = 0
        total_relations = 0
        
        # Process first few chunks for entity extraction (to save time)
        for i, (chunk_id, chunk_text) in enumerate(zip(chunk_ids[:5], chunk_texts[:5])):
            entities, relations = await knowledge_graph.extract_and_add(
                chunk_text,
                doc_id,
                chunk_id
            )
            total_entities += entities
            total_relations += relations
        
        # Update document status
        db.update_document_status(doc_id, 'completed')
        
        # Save indexes
        config = get_config()
        vector_index.save(str(Path(config.paths.indexes) / "vector"))
        
        processing_time = (time.time() - start_time) * 1000
        
        logger.info(f"Document ingested successfully: {doc_id} ({processing_time:.0f}ms)")
        
        return IngestResponse(
            doc_id=doc_id,
            status=ProcessingStatus.COMPLETED,
            message=f"Document '{title}' ingested successfully",
            chunks_created=len(chunks),
            entities_extracted=total_entities,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Ingestion failed: {e}", exc_info=True)
        
        # Update status to failed if doc was created
        if 'doc_id' in locals():
            try:
                db.update_document_status(doc_id, 'failed')
            except:
                pass
        
        raise HTTPException(500, f"Ingestion failed: {str(e)}")


@router.get("/documents")
async def list_documents(
    limit: int = 100,
    offset: int = 0,
    status: Optional[str] = None
):
    """List ingested documents"""
    db = get_db()
    documents = db.list_documents(limit, offset, status)
    
    return {
        'documents': documents,
        'total': len(documents),
        'limit': limit,
        'offset': offset
    }


@router.get("/documents/{doc_id}")
async def get_document(doc_id: str):
    """Get document details"""
    db = get_db()
    doc = db.get_document(doc_id)
    
    if not doc:
        raise HTTPException(404, "Document not found")
    
    # Get chunks
    chunks = db.get_chunks_by_doc(doc_id)
    
    return {
        'document': doc,
        'chunk_count': len(chunks)
    }


@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document"""
    db = get_db()
    doc = db.get_document(doc_id)
    
    if not doc:
        raise HTTPException(404, "Document not found")
    
    # Get chunk IDs
    chunks = db.get_chunks_by_doc(doc_id)
    chunk_ids = [c['chunk_id'] for c in chunks]
    
    # Remove from vector index
    vector_index = get_vector_index()
    vector_index.remove_chunks(chunk_ids)
    
    # Delete from database (cascades to chunks)
    db.execute_update("DELETE FROM documents WHERE doc_id = ?", (doc_id,))
    
    return {'message': f'Document {doc_id} deleted successfully'}
