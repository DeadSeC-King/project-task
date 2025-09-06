import tkinter as tk
from tkinter import messagebox, ttk
import sqlite3

conn = sqlite3.connect("criminals.db")
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS criminals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    crime TEXT NOT NULL,
    age INTEGER
)
""")
conn.commit()

def login():
    user = entry_user.get()
    pwd = entry_pass.get()
    if user == "admin" and pwd == "123":
        login_win.destroy()
        open_dashboard()
    else:
        messagebox.showerror("Error", "Invalid Credentials")

login_win = tk.Tk()
login_win.title("Login")
login_win.geometry("300x200")

lbl_user = tk.Label(login_win, text="Username:")
lbl_user.pack(pady=5)
entry_user = tk.Entry(login_win)
entry_user.pack(pady=5)

lbl_pass = tk.Label(login_win, text="Password:")
lbl_pass.pack(pady=5)
entry_pass = tk.Entry(login_win, show="*")
entry_pass.pack(pady=5)

btn_login = tk.Button(login_win, text="Login", command=login)
btn_login.pack(pady=10)

def open_dashboard():
    dash = tk.Tk()
    dash.title("Criminal Database")
    dash.geometry("600x500")

    tree = ttk.Treeview(dash, columns=("ID", "Name", "Crime", "Age"), show="headings")
    tree.heading("ID", text="ID")
    tree.heading("Name", text="Name")
    tree.heading("Crime", text="Crime")
    tree.heading("Age", text="Age")
    tree.pack(fill=tk.BOTH, expand=True, pady=10)

    def refresh_table():
        for row in tree.get_children():
            tree.delete(row)
        cursor.execute("SELECT * FROM criminals")
        for record in cursor.fetchall():
            tree.insert("", tk.END, values=record)

    def add_record():
        name = entry_name.get()
        crime = entry_crime.get()
        age = entry_age.get()
        if name and crime and age:
            cursor.execute("INSERT INTO criminals (name, crime, age) VALUES (?, ?, ?)", (name, crime, age))
            conn.commit()
            messagebox.showinfo("Success", "Record Added with unique ID")
            entry_name.delete(0, tk.END)
            entry_crime.delete(0, tk.END)
            entry_age.delete(0, tk.END)
            refresh_table()
        else:
            messagebox.showerror("Error", "All fields required")

    def search_record():
        name = entry_name.get()
        crime = entry_crime.get()
        query = "SELECT * FROM criminals WHERE 1=1"
        params = []
        if name:
            query += " AND name=?"
            params.append(name)
        if crime:
            query += " AND crime=?"
            params.append(crime)

        cursor.execute(query, tuple(params))
        results = cursor.fetchall()

        for row in tree.get_children():
            tree.delete(row)
        for r in results:
            tree.insert("", tk.END, values=r)

    def delete_record():
        record_id = entry_id.get()
        if record_id:
            cursor.execute("DELETE FROM criminals WHERE id=?", (record_id,))
            conn.commit()
            messagebox.showinfo("Deleted", f"Record with ID {record_id} deleted (if it existed)")
            entry_id.delete(0, tk.END)
            refresh_table()
        else:
            messagebox.showerror("Error", "Enter a valid ID to delete")

    tk.Label(dash, text="Name:").pack()
    entry_name = tk.Entry(dash)
    entry_name.pack()

    tk.Label(dash, text="Crime:").pack()
    entry_crime = tk.Entry(dash)
    entry_crime.pack()

    tk.Label(dash, text="Age:").pack()
    entry_age = tk.Entry(dash)
    entry_age.pack()

    tk.Label(dash, text="Record ID (for delete):").pack()
    entry_id = tk.Entry(dash)
    entry_id.pack()

    tk.Button(dash, text="Add Record", command=add_record).pack(pady=5)
    tk.Button(dash, text="Search Record", command=search_record).pack(pady=5)
    tk.Button(dash, text="Delete Record", command=delete_record).pack(pady=5)
    tk.Button(dash, text="Refresh Table", command=refresh_table).pack(pady=5)

    refresh_table()
    dash.mainloop()

login_win.mainloop()
