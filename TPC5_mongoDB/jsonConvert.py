import json

def open_json(filename):
    with open(filename, encoding="utf-8") as f:
        data = json.load(f)
    return data


dataset = open_json("cinema.json")
lista = []
i = 1

for s in dataset:
     s["_id"] = i
     i += 1

with open('novo_cinema.json', 'w', encoding='utf-8') as arquivo:
    json.dump(dataset, arquivo)

print("Arquivo JSON criado com sucesso!")