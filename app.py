from flask import Flask, render_template, request
import sqlite3

app = Flask(__name__)
DATABASE = "database.db"


def conectar_banco():
    conexao = sqlite3.connect(DATABASE)
    conexao.row_factory = sqlite3.Row
    return conexao


def criar_tabelas():
    conexao = conectar_banco()
    conexao.execute("""
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT,
            preco REAL NOT NULL,
            imagem TEXT
        )
    """)
    conexao.commit()
    conexao.close()


@app.route("/")
def inicio():
    pesquisa = request.args.get("pesquisa", "").strip()

    conexao = conectar_banco()

    if pesquisa:
        produtos = conexao.execute(
            "SELECT * FROM produtos WHERE nome LIKE ? ORDER BY id DESC",
            (f"%{pesquisa}%",)
        ).fetchall()
    else:
        produtos = conexao.execute(
            "SELECT * FROM produtos ORDER BY id DESC"
        ).fetchall()

    conexao.close()
    return render_template("index.html", produtos=produtos, pesquisa=pesquisa)


if __name__ == "__main__":
    criar_tabelas()
    app.run(debug=True)
