import cohere
import os

COHERE_API_KEY = os.getenv('COHERE_API_KEY')

co = cohere.ClientV2(COHERE_API_KEY)

response = co.chat(
    model="command-r-plus-08-2024",
    messages=[
        {
            "role": "user",
            "content": "hello world!"
        }
    ]
)

print(response.message.content[0].text)
