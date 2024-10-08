import cohere
import os
import sys

def read_file(file_path):
    """Read the contents of a file."""
    with open(file_path, 'r') as file:
        return file.read()

def main():
    # Get the file name from standard input (stdin)
    file_name = input("Enter the name of the file: ")
    
    # Read the content of the file
    file_content = read_file(file_name)

    content = file_content + "/n/n From this full-text paper on PubMed Central, I’m looking to identify antigens that are highly expressed on cancer cells. Please extract: A list of antigens with strong expression on cancer cells. Any information on their expression levels across different cancer types. Mentions of these antigens in the context of immunotherapy or tumor targeting."

    COHERE_API_KEY = os.getenv('COHERE_API_KEY')
    co = cohere.ClientV2(COHERE_API_KEY)

    response = co.chat(
        model="command-r-plus-08-2024",
        messages=[
            {
                "role": "user",
                "content": file_content
            }
        ]
    )

    print(response.message.content[0].text)

if __name__ == "__main__":
    main()

    
