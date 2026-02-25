import json

def open_json(filename):
    with open(filename, encoding="utf-8") as f:
        data = json.load(f)
    return data

dataset = open_json("emd.json")
dataset_novo = {}
lista = []
i = 0
#emd.json = "Exames médicos desportivos"

for s in dataset:
     novo_dicionario = {}
     novo_dicionario["id"] = i
     novo_dicionario["data"] = s["dataEMD"]
     nome = s["nome"]["primeiro"] + " " + s["nome"]["último"]
     novo_dicionario["nome"] = nome
     novo_dicionario["idade"] = s["idade"]
     novo_dicionario["genero"] = s["género"]
     novo_dicionario["morada"] = s["morada"]
     novo_dicionario["modalidade"] = s["modalidade"]
     novo_dicionario["clube"] = s["clube"]
     novo_dicionario["email"] = s["email"]
     if s["federado"] == True:
         novo_dicionario["federado"] = "Sim"
     else:
         novo_dicionario["federado"] = "Não"
     if s["resultado"] == True:
         novo_dicionario["resultado"] = "Aprovado"
     else:
         novo_dicionario["resultado"] = "Rejeitado"

     lista.append(novo_dicionario)
     i += 1

dataset_novo["Exames"] = lista

with open('novo_emd.json', 'w', encoding='utf-8') as arquivo:
    json.dump(dataset_novo, arquivo)

print("Arquivo JSON criado com sucesso!")