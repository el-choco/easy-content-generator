# Easy Content Generator

## Project Description
The Easy Content Generator is a versatile tool designed to automate the process of content creation. It allows users to generate diverse types of content effortlessly, making it an essential resource for content creators, marketers, and developers.

## Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone https://github.com/el-choco/easy-content-generator.git
   cd easy-content-generator
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the application**:
   ```bash
   npm start
   ```
4. **Usage**: Follow the prompts to generate your desired content type.

## API Documentation
### Endpoints
- **GET /api/content**  
  Retrieve generated content.
  - **Query Parameters**:  
    - `type`: (string) Type of content to generate (e.g., blog, video, social).

- **POST /api/content**  
  Generate new content.  
  - **Request Body**:  
    - `type`: (string) Type of content to be generated.
    - `data`: (object) Additional parameters for content customization.

### Example
```bash
curl -X GET 'https://api.yourdomain.com/api/content?type=blog'
```