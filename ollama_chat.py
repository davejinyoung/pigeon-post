import llama_cpp

# Initialize LLaMA model
llama = llama_cpp.Llama(model_path="path/to/your/llama-model")

# Generate a response
response = llama.generate("Your prompt here")

print(response)