from openai import OpenAI
client = OpenAI(base_url="https://chatapi.onechats.top/v1",api_key="sk-0QfviDIVuieWU5t99aF5648fE5D04614974bE8C57f8b34E0")

audio_file= open("/Users/hxc/Downloads/海南长臂猿的叫声.wav", "rb")
transcription = client.audio.transcriptions.create(
  model="whisper-1", 
  file=audio_file
)
print(transcription.text)