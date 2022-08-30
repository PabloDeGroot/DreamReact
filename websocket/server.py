import asyncio
from http import client
import json
from multiprocessing import connection
 
import websockets
 
# create handler for each connection
clients = []
connections = [] #no va ?? F#€@
async def handler(websocket, path):
    
    data = await websocket.recv()
    if clients:
        await websocket.send(json.dumps(clients)) # enviar al conectado la lista de clientes
    print(data)

   
    clients.append(data)


 
 
 
start_server = websockets.serve(handler, "localhost", 8000)
 
 
 
asyncio.get_event_loop().run_until_complete(start_server)
 
asyncio.get_event_loop().run_forever()