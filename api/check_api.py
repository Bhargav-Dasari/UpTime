import httpx
import asyncio
import os
from supabase import create_client
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()


urls = ['https://www.google.com', 'https://github.com/', 'https://aws.amazon.com/']


supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_key"))

app = FastAPI()

async def req(client, url):
    try:
        response = await client.get(url, timeout=2)
        return {"domain":url, 
                "status_code": response.status_code, 
                "response_time": round(response.elapsed.total_seconds(),2)}
    except Exception:
        return {
            "domain": url,
            "status_code": 500,
            "response_time":0
        }
    

async def main():
    
    async with httpx.AsyncClient() as client:
        x = [req(client, url) for url in urls]
        response = await asyncio.gather(*x) 
        return response


@app.get("/api/check-sites")
async def check_sites():
    data = await main()
    res = (
    supabase
    .table("uptime_checks")
    .insert(data)
    .execute()
)
    return {
        "inserted data": len(data),
        "data": data
    }

# data = asyncio.run(main())
# res = (
#     supabase
#     .table("uptime_checks")
#     .insert(data)
#     .execute()
# )