import requests

class GeminiAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.gemini.com/v1"

    def generate_content(self, prompt):
        endpoint = f"{self.base_url}/generate"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "prompt": prompt
        }
        
        response = requests.post(endpoint, headers=headers, json=payload)
        
        if response.status_code == 200:
            return response.json().get('content')
        else:
            raise Exception(f"Error from Gemini API: {response.status_code} - {response.text}")

# Example usage
if __name__ == "__main__":
    api_key = "your_gemini_api_key"
    gemini = GeminiAPI(api_key)
    
    prompt = "Write a short story about a cat in space."
    try:
        content = gemini.generate_content(prompt)
        print(content)
    except Exception as e:
        print(e)