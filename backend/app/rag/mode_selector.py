"""
MemoRAG ULTRA - Query Mode Selector
Automatically select between Speed and Deep mode based on query complexity
"""
from typing import Dict, Any
import logging

from app.core.config import get_config
from app.core.lm_studio_client import get_lm_studio_client
from app.core.models import QueryMode

logger = logging.getLogger(__name__)


class QueryModeSelector:
    """Intelligent mode selection based on query analysis"""
    
    def __init__(self):
        self.config = get_config().rag
        self.llm_client = get_lm_studio_client()
    
    async def select_mode(self, query: str) -> QueryMode:
        """
        Analyze query and select appropriate mode
        
        Args:
            query: User query
            
        Returns:
            QueryMode (SPEED or DEEP)
        """
        # Calculate complexity score
        complexity_score = await self._calculate_complexity(query)
        
        logger.info(f"Query complexity score: {complexity_score:.2f}")
        
        # Select mode based on threshold
        if complexity_score >= self.config.mode_selection_threshold:
            logger.info("Selected DEEP mode")
            return QueryMode.DEEP
        else:
            logger.info("Selected SPEED mode")
            return QueryMode.SPEED
    
    async def _calculate_complexity(self, query: str) -> float:
        """
        Calculate query complexity score (0-1)
        
        Factors:
        - Query length
        - Number of entities
        - Question type (comparative, temporal, causal = complex)
        - Presence of multiple questions
        """
        score = 0.0
        
        # Factor 1: Query length (longer = more complex)
        word_count = len(query.split())
        if word_count > 20:
            score += 0.3
        elif word_count > 10:
            score += 0.15
        
        # Factor 2: Multiple questions
        question_marks = query.count('?')
        if question_marks > 1:
            score += 0.2
        
        # Factor 3: Comparative/temporal/causal keywords
        complex_keywords = [
            'compare', 'difference', 'versus', 'vs', 'contrast',
            'how', 'why', 'when', 'evolution', 'change', 'trend',
            'cause', 'effect', 'impact', 'influence',
            'relationship', 'between', 'among'
        ]
        
        query_lower = query.lower()
        keyword_count = sum(1 for kw in complex_keywords if kw in query_lower)
        score += min(keyword_count * 0.15, 0.4)
        
        # Factor 4: Intent detection (async)
        try:
            intent = await self.llm_client.detect_intent(query)
            if intent in ['comparative', 'temporal', 'causal']:
                score += 0.3
            elif intent == 'exploratory':
                score += 0.2
        except Exception as e:
            logger.warning(f"Intent detection failed: {e}")
        
        # Normalize to 0-1
        return min(score, 1.0)
    
    def explain_selection(
        self,
        query: str,
        mode: QueryMode,
        complexity_score: float
    ) -> str:
        """Generate explanation for mode selection"""
        if mode == QueryMode.SPEED:
            return (
                f"Using Speed Mode (complexity: {complexity_score:.2f}). "
                f"This appears to be a straightforward factual query that can be "
                f"answered quickly with vector search."
            )
        else:
            return (
                f"Using Deep Mode (complexity: {complexity_score:.2f}). "
                f"This query requires multi-hop reasoning across the knowledge graph "
                f"to provide a comprehensive answer."
            )


def get_mode_selector() -> QueryModeSelector:
    """Get query mode selector instance"""
    return QueryModeSelector()
