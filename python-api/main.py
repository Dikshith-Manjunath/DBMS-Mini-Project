import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

# LangChain imports
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain.prompts import PromptTemplate
from langchain.schema import BaseMessage, HumanMessage, AIMessage

# Database imports
import psycopg2
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="DBMS Mini Project - AI Assistant", version="1.0.0")

# CORS middleware to allow Next.js frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str

# In-memory session storage (use Redis in production)
conversation_memories: Dict[str, ConversationBufferMemory] = {}

# Database connection
def get_db_connection():
    """Get database connection using environment variables"""
    try:
        connection_string = (
            f"postgresql://{os.getenv('POSTGRES_USER', 'postgres')}:"
            f"{os.getenv('POSTGRES_PASSWORD', 'password')}@"
            f"{os.getenv('POSTGRES_HOST', 'localhost')}:"
            f"{os.getenv('POSTGRES_PORT', '5432')}/"
            f"{os.getenv('POSTGRES_DATABASE', 'dbms_mini_2')}"
        )
        engine = create_engine(connection_string)
        return engine
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

# Initialize NVIDIA LLM
def initialize_nvidia_llm():
    """Initialize NVIDIA Nemotron Ultra model with LangChain"""
    try:
        # Use NVIDIA API key from environment
        nvidia_api_key = os.getenv("NVIDIA_API_KEY")
        if not nvidia_api_key:
            raise ValueError("NVIDIA_API_KEY not found in environment variables")
        
        # Initialize ChatNVIDIA with Nemotron Ultra
        llm = ChatNVIDIA(
            model="nvidia/nemotron-4-340b-instruct",  # Nemotron Ultra model
            api_key=nvidia_api_key,
            temperature=0.7,
            max_tokens=1000,
        )
        return llm
    except Exception as e:
        print(f"Error initializing NVIDIA LLM: {e}")
        return None

# Database schema context for the AI
DATABASE_CONTEXT = """
You are a helpful and polite database assistant for an e-commerce system. You have access to the following database schema:

DATABASE SCHEMA:
1. categories (category_id, category_name, description, created_date)
   - Categories: Electronics, Clothing, Beauty, Home & Garden, Sports

2. products (product_id, product_name, category_id, price, stock_quantity, description, created_date)
   - Products include smartphones, laptops, t-shirts, jeans, cosmetics, etc.

3. customers (customer_id, first_name, last_name, email, phone, gender, age, address, city, registration_date)
   - Customers from various cities like New York, Los Angeles, Chicago, etc.

4. transactions (transaction_id, customer_id, transaction_date, total_amount, payment_method, status)
   - Payment methods: Credit Card, Debit Card, Cash, PayPal

5. transaction_details (detail_id, transaction_id, product_id, quantity, unit_price, line_total)
   - Detailed line items for each transaction

RELATIONSHIPS:
- products.category_id → categories.category_id
- transactions.customer_id → customers.customer_id  
- transaction_details.transaction_id → transactions.transaction_id
- transaction_details.product_id → products.product_id

PERSONALITY AND BEHAVIOR:
- Always be polite, helpful, and professional
- Remember the conversation context and refer to previous messages when relevant
- Provide detailed and informative responses
- If asked about data analysis, suggest helpful SQL queries or insights
- Be encouraging and supportive in your responses
- Use proper greetings and courteous language

CAPABILITIES:
- Analyze sales data and trends
- Provide customer insights and demographics
- Help with product inventory questions
- Explain database relationships and structure
- Suggest useful SQL queries for data analysis
- Remember conversation history for better context

Please maintain a helpful and polite tone throughout our conversation.
"""

# Create conversation prompt template
conversation_prompt = PromptTemplate(
    input_variables=["history", "input"],
    template=f"""{DATABASE_CONTEXT}

Previous conversation:
{{history}}

Current user input: {{input}}

Please provide a helpful and polite response based on the database context and conversation history.
"""
)

# Initialize global variables
llm = None
db_engine = None

def get_or_create_memory(session_id: str) -> ConversationBufferMemory:
    """Get or create conversation memory for a session"""
    if session_id not in conversation_memories:
        conversation_memories[session_id] = ConversationBufferMemory(
            return_messages=True,
            memory_key="history"
        )
    return conversation_memories[session_id]

def generate_fallback_response(message: str) -> str:
    """Generate fallbaccd python-api
bash start.sh
cd /home/dikshith/Documents/Projects/AI/DBMS-Mini-Project/python-api && source venv/bin/activate && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reloadk response when LLM is not available"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ["hello", "hi", "hey", "greetings"]):
        return """Hello! I'm your polite database assistant for this e-commerce system. I'm here to help you understand and analyze your database containing information about categories, products, customers, and transactions. How may I assist you today?"""
    
    if any(word in message_lower for word in ["customer", "customers", "user", "users"]):
        return """I'd be happy to help you with customer information! Our database contains comprehensive customer details including names, contact information, demographics, and registration dates. We have customers from major cities across the country. Would you like me to help you analyze customer data, demographics, or suggest specific queries for customer insights?"""
    
    if any(word in message_lower for word in ["product", "products", "inventory", "stock"]):
        return """I can certainly assist you with product and inventory analysis! Our product database includes items across multiple categories such as Electronics (smartphones, laptops, headphones), Clothing (t-shirts, jeans, shoes), Beauty products (cosmetics, personal care), and more. Each product has detailed information including pricing, stock quantities, and descriptions. What specific product information would you like to explore?"""
    
    if any(word in message_lower for word in ["sales", "transaction", "transactions", "revenue", "money"]):
        return """I'm here to help you analyze sales and transaction data! Our comprehensive transaction records include payment methods (Credit Card, Debit Card, Cash, PayPal), transaction dates, amounts, and detailed line items. I can help you understand sales patterns, customer purchase behavior, and revenue trends. What specific sales insights would you like me to help you with?"""
    
    if any(word in message_lower for word in ["category", "categories"]):
        return """I'd be pleased to help you understand our product categories! Our database organizes products into well-defined categories: Electronics, Clothing, Beauty, Home & Garden, and Sports. Each category contains multiple products with detailed descriptions and relationships. Would you like to explore category-wise analysis or see how products are distributed across categories?"""
    
    if any(word in message_lower for word in ["database", "schema", "table", "tables", "structure"]):
        return """I'm happy to explain our database structure! Our e-commerce database consists of 5 main tables: Categories, Products, Customers, Transactions, and Transaction Details. These tables are thoughtfully connected through foreign key relationships to maintain data integrity and enable comprehensive analysis. Would you like me to explain any specific table structure, relationships, or suggest ways to query the data?"""
    
    if any(word in message_lower for word in ["help", "what", "how", "can you"]):
        return """I'm here to provide friendly assistance with your e-commerce database! Here's how I can help you:

• **Customer Analytics**: Analyze customer demographics, behavior, and registration patterns
• **Product Management**: Explore inventory levels, product categories, and pricing insights  
• **Sales Analysis**: Examine transaction trends, revenue patterns, and payment preferences
• **Database Structure**: Explain table relationships and suggest useful queries
• **Data Insights**: Provide recommendations for business intelligence and reporting

I remember our conversation context, so feel free to ask follow-up questions. What would you like to explore first?"""
    
    # Default polite response
    return """Thank you for your message! I'm your helpful database assistant for this e-commerce system. I have comprehensive knowledge about your database schema including categories, products, customers, and transactions. I maintain conversation context and always strive to provide polite and informative responses. 

Could you please let me know what specific aspect of your database you'd like to explore? I'm here to help with data analysis, explanations, or any questions you might have!"""

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global llm, db_engine
    
    print("🚀 Starting DBMS Mini Project AI Assistant...")
    
    # Initialize NVIDIA LLM
    print("🤖 Initializing NVIDIA Nemotron Ultra model...")
    llm = initialize_nvidia_llm()
    if llm:
        print("✅ NVIDIA LLM initialized successfully!")
    else:
        print("⚠️ NVIDIA LLM initialization failed - using fallback responses")
    
    # Initialize database connection
    print("🗄️ Connecting to database...")
    db_engine = get_db_connection()
    if db_engine:
        print("✅ Database connection established!")
    else:
        print("⚠️ Database connection failed")
    
    print("✨ AI Assistant is ready to help!")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "DBMS Mini Project AI Assistant",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "llm_status": "connected" if llm else "disconnected",
        "database_status": "connected" if db_engine else "disconnected",
        "active_sessions": len(conversation_memories)
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint with conversation memory"""
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Validate input
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        message = request.message.strip()
        
        # Get or create conversation memory for this session
        memory = get_or_create_memory(session_id)
        
        # Generate response
        if llm:
            try:
                # Get conversation history
                history = memory.chat_memory.messages if hasattr(memory, 'chat_memory') else []
                history_text = ""
                if history:
                    for msg in history[-10:]:  # Last 10 messages for context
                        if hasattr(msg, 'content'):
                            role = "User" if isinstance(msg, HumanMessage) else "Assistant"
                            history_text += f"{role}: {msg.content}\n"
                
                # Create the full prompt
                full_prompt = f"""{DATABASE_CONTEXT}

Previous conversation:
{history_text}

Current user input: {message}

Please provide a helpful and polite response based on the database context and conversation history.
"""
                
                # Get response from LLM directly
                response = llm.invoke([HumanMessage(content=full_prompt)]).content
                
                # Save to memory
                memory.save_context({"input": message}, {"output": response})
                
            except Exception as e:
                print(f"LLM Error: {e}")
                # Use fallback response if LLM fails
                response = generate_fallback_response(message)
                # Still save to memory for context
                memory.save_context({"input": message}, {"output": response})
        else:
            # Use fallback response
            response = generate_fallback_response(message)
            # Save to memory for context
            memory.save_context({"input": message}, {"output": response})
        
        # Return response
        return ChatResponse(
            response=response,
            session_id=session_id,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")

@app.get("/sessions")
async def get_active_sessions():
    """Get information about active chat sessions"""
    return {
        "active_sessions": len(conversation_memories),
        "session_ids": list(conversation_memories.keys())
    }

@app.delete("/sessions/{session_id}")
async def clear_session(session_id: str):
    """Clear a specific chat session"""
    if session_id in conversation_memories:
        del conversation_memories[session_id]
        return {"message": f"Session {session_id} cleared successfully"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@app.delete("/sessions")
async def clear_all_sessions():
    """Clear all chat sessions"""
    conversation_memories.clear()
    return {"message": "All sessions cleared successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
