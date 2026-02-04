import json, os, shutil

def open_json(filename):
    with open(filename, encoding="utf-8") as f:
        data = json.load(f)
    return data

def mk_dir(relative_path):
    if not os.path.exists(relative_path):
        os.mkdir(relative_path)
    else:
        shutil.rmtree(relative_path)

def new_file(filename,content):
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

# --------------------------------------------------
mk_dir("output")
mapa = open_json("dataset_reparacoes.json")

reparacoes = mapa["reparacoes"]
intervencoes_todas = []
viaturas = []
link_listr = ""
it = 1
for r in reparacoes:
    veiculo = r["viatura"]
    viaturas.append(r["viatura"])
    intervencoes_todas += r["intervencoes"]
    r["id"] = f'''RE{it}'''
    it +=1
    link_listr += f'''
        <tr>
            <td>{r["data"]}</td>
            <td>{r["nif"]}</td>
            <td>{r["nome"]}</td>
            <td>{veiculo["marca"]}</td>
            <td>{veiculo["modelo"]}</td>
            <td>{r["nr_intervencoes"]}</td>
            <td><a href="{r["id"]}.html">Ver Informação</a></td>
        </tr>
'''
# -------------------- Página Reparação --------------------------
def print_viatura(dic_r):
    result = f'''
        <tr>
            <th colspan="3">Viatura</th>
        </tr>
        <tr>
            <th>Marca</th>
        <td>{(dic_r["viatura"])["marca"]}</td>
        </tr>
        <tr>
            <th>Modelo</th>
        <td>{(dic_r["viatura"])["modelo"]}</td>
        </tr>
        <tr>
            <th>Matrícula</th>
            <td>{(dic_r["viatura"])["matricula"]}</td>
        </tr>
'''
    return result

def print_intervencoes(dic_r):
    result = f'''
        <tr>
            <th colspan="{3 * dic_r["nr_intervencoes"]}">Intervenções</th>
        </tr>
'''
    for d in dic_r["intervencoes"]:
        result += f'''
        <tr>
            <th>Código</th>
        <td>{d["codigo"]}</td>
        </tr>
        <tr>
            <th>Nome</th>
        <td>{d["nome"]}</td>
        </tr>
        <tr>
            <th>Descrição</th>
            <td>{d["descricao"]}</td>
        </tr>
'''
    return result


for r in reparacoes:
    html_r = f'''
        <html>
    <head>
        <title>{r["data"]} - {r["nome"]}</title>
        <meta charset = "utf-8">
    <head>
    <body>
        <h3>{r["data"]} - {r["nome"]}</h3>
        <table border = "1">
            <tr><th>Nome</th><td>{r["nome"]}</td></tr>
            <tr><th>NIF</th><td>{r["nif"]}</td></tr>
            <tr><th>Data</th><td>{r["data"]}</td></tr>
            <tr><th>Número de Intervenções</th><td>{r["nr_intervencoes"]}</td></tr>
            {print_viatura(r)}
            
            {print_intervencoes(r)}
        </table>
        <hr/>
        <address>
            <a href = "index.html">Voltar ao índice</a>
        <address>
        <hr/>
    </body>
<html>
'''
    new_file(f'''./output/{r["id"]}.html''',html_r)
#--------------------------------------------------------------------------------------
#--------------------------Página Intervenção--------------------------
def print_reparacoes(dic_r,codigo_i):
    result = ""
    for r in dic_r:
        for ri in r["intervencoes"]:
            if ri["codigo"] == codigo_i :
                result= f'''
        <tr>
            <td>{r["data"]}</td>
            <td>{r["nif"]}</td>
            <td>{r["nome"]}</td>
            <td>{(r["viatura"])["marca"]}</td>
            <td>{(r["viatura"])["modelo"]}</td>
            <td><a href="{r["id"]}.html">Ver Informação</a></td>
        </tr>
'''
    return result


intervencoes = []
for i in intervencoes_todas:
    if i not in intervencoes:
        intervencoes.append(i)


intervencoes.sort(key = lambda l: l["codigo"])

link_listi = ""

for i in intervencoes:
    html_i = f'''
<html>
    <head>
        <title>{i["nome"]}</title>
        <meta charset = "utf-8">
    <head>
    <body>
        <h3>{i["nome"]}</h3>
        <table border = "1">
            <tr><th>Código</th><td>{i["codigo"]}</td></tr>
            <tr><th>Nome</th><td>{i["nome"]}</td></tr>
            <tr><th>Descrição</th><td>{i["descricao"]}</td></tr>
        </table>
        <hr/>
        <h3>Reparações que usaram esta Intervenção</h3>
        <table border = "1">
            <tr>
                <th>Data</th>
                <th>NIF</th>
                <th>Nome</th>
                <th>Marca</th>
                <th>Modelo</th>
                
            </tr>
            {print_reparacoes(reparacoes,i["codigo"])}
        </table>
        <hr/>
        <address>
            <a href = "index.html">Voltar ao índice</a>
        </address>
    </body>
<html>
'''
    new_file(f"./output/{i["codigo"]}.html",html_i)
    link_listi += f'''
            <tr>
                <td><a href="{i["codigo"]}.html">{i["codigo"]}</td>
                <td>{i["nome"]}</td>
                <td>{i["descricao"]}</td>
            </tr>
'''
#----------------------------------------------------




viaturas_copia = viaturas[:]
viaturas_sem_repetidos = []
link_listv = ""

for v in viaturas:
    del v["matricula"]

for v in viaturas:

    v["nrcarros"] = viaturas.count(v)

#print(viaturas)
for v in viaturas:
    if v not in viaturas_sem_repetidos:
        viaturas_sem_repetidos.append(v)

#print(viaturas_sem_repetidos)

viaturas_sem_repetidos.sort(key=lambda x: (x["marca"], x["modelo"]))

#print(viaturas_sem_repetidos)
itv = 1

#-----------------Página Viaturas---------------------------------

def print_reparacoes_v(dic_r,marca,modelo):
    result = ""
    for r in dic_r:
        if((r["viatura"])["marca"] == marca and (r["viatura"])["modelo"] == modelo):
            result += f'''
        <tr>
            <td>{r["data"]}</td>
            <td>{r["nif"]}</td>
            <td>{r["nome"]}</td>
            <td><a href="{r["id"]}.html">Ver Informação</a></td>
        </tr>
'''
    return result

for v in viaturas_sem_repetidos:
    v["idViatura"]=f'''V{itv}'''
    itv += 1
    html_v = f'''
    <html>
    <head>
        <title>{v["marca"]} : {v["modelo"]}</title>
        <meta charset = "utf-8">
    <head>
    <body>
        <h3>{v["marca"]} : {v["modelo"]}</h3>
        <table border = "1">
            <tr><th>Marca</th><td>{v["marca"]}</td></tr>
            <tr><th>Modelo</th><td>{v["modelo"]}</td></tr>
        </table>
        <hr/>
        <h3>Reparações que se efetuaram a este carro</h3>
        <table border = "1">
            <tr>
                <th>Data</th>
                <th>NIF</th>
                <th>Nome</th>
            </tr>
            {print_reparacoes_v(reparacoes,v["marca"],v["modelo"])}
        </table>
        <hr/>
        <address>
            <a href = "index.html">Voltar ao índice</a>
        </address>
    </body>
<html>
'''
    link_listv +=f'''
            <tr>
                <td>{v["marca"]}</td>
                <td>{v["modelo"]}</td>
                <td>{v["nrcarros"]}</td>
                <td><a href="{v["idViatura"]}.html">Ver Infromação</a></td>
            </tr>
'''
    new_file(f"./output/{v["idViatura"]}.html",html_v)


# ---------------------------- Página Principal -----------------------------

html_p = f'''
<html>
    <head>
        <title>Reparações</title>
        <meta charset = "utf-8">
    <head>
    <body>
        <h3>Reparações realizadas</h3>
        <table border = "1">
            <tr>
                <th>Data</th>
                <th>NIF</th>
                <th>Nome</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Número de intervenções</th>
            </tr>
                    {link_listr}
        </table>
        <h3>Intervenções</h3>
        <table border = "1">
            <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Descricao</th>
            </tr>
                {link_listi}
        </table>
        <h3>Modelos de Carros Reparados</h3>
        <table border = "1">
            <tr>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Número de carros</th>
            </tr>
                {link_listv}
        </table
    </body>
<html>
'''

new_file("./output/index.html",html_p)