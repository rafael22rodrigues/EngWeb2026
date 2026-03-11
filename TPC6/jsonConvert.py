import json

def open_json(filename):
    with open(filename, encoding="utf-8") as f:
        data = json.load(f)
    return data


dataset = open_json("cinema.json")
lista = []
i = 1
j = 1
k = 1
atores = []
generos = []
nomes_atores_adicionados = set()
genres_adicionados = set()

for s in dataset["filmes"]:
     ator = {}
     genero = {}
     #s["_id"] = f"filmenr{i}"
     campos_desejados = ["title", "year"]
     i += 1
     for e in s["cast"]:
         # Verificar se ator já foi adicionado (usando set para eficiência)
         if e not in nomes_atores_adicionados:
             # Calcular número de filmes do ator
             filmes = [f for f in dataset["filmes"] if e in f["cast"]]
             # Criar novo dicionário para o ator
             ator = {
                 #"_id": f"atornr{j}",
                 "nome": e,
                 "filmes": [
                     {c : f[c] for c in campos_desejados if c in f}
                     for f in filmes
                 ],
                 "nr_filmes": len(filmes)
             }
             nomes_atores_adicionados.add(e)
             atores.append(ator)
             j += 1
     for g in s["genres"]:
        if g not in genres_adicionados:
            filmes = [f for f in dataset["filmes"] if g in f["genres"]]

            genero = {
                #"_id": f"generonr{k}",
                "nome": g,
                "filmes": [
                    {c : f[c] for c in campos_desejados if c in f}
                    for f in filmes
                ],
                "nr_filmes": len(filmes)
            }
            genres_adicionados.add(g)
            generos.append(genero)
            k += 1

dataset["atores"] = atores
dataset["generos"] = generos

with open('api_dados/filmes.json', 'w', encoding='utf-8') as arquivo:
    json.dump(dataset["filmes"], arquivo)

with open('api_dados/atores.json', 'w', encoding='utf-8') as arquivo:
    json.dump(dataset["atores"], arquivo)

with open('api_dados/generos.json', 'w', encoding='utf-8') as arquivo:
    json.dump(dataset["generos"], arquivo)
    
print("Arquivo JSON criado com sucesso!")