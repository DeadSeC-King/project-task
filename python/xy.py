# --- Python + Tkinter + MySQL ---
import tkinter as tk
from tkinter import messagebox
import mysql.connector

# ------------------ DB Setup ------------------
def connect_db():
    try:
        conn = mysql.connector.connect(
            host="localhost",   # change if needed
            user="root",        # your mysql user
            password="password",# your mysql password
            database="school"   # create this DB before running
        )
        return conn
    except mysql.connector.Error as err:
        messagebox.showerror("DB Error", f"Error: {err}")
        return None

def create_table():
    conn = connect_db()
    if conn:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                age INT CHECK(age > 0),
                course VARCHAR(50) NOT NULL
            )
        """)
        conn.commit()
        conn.close()

# ------------------ CRUD Operations ------------------
def add_student(name, age, course):
    conn = connect_db()
    if conn:
        cur = conn.cursor()
        cur.execute("INSERT INTO students (name, age, course) VALUES (%s, %s, %s)",
                    (name, age, course))
        conn.commit()
        conn.close()

def get_students():
    conn = connect_db()
    if conn:
        cur = conn.cursor()
        cur.execute("SELECT id, name, age, course FROM students")
        rows = cur.fetchall()
        conn.close()
        return rows
    return []

def delete_student(student_id):
    conn = connect_db()
    if conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM students WHERE id=%s", (student_id,))
        conn.commit()
        conn.close()

# ------------------ GUI with Tkinter ------------------
class StudentApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Student Management System")
        self.root.geometry("400x400")

        tk.Label(root, text="Name").pack()
        self.name_entry = tk.Entry(root)
        self.name_entry.pack()

        tk.Label(root, text="Age").pack()
        self.age_entry = tk.Entry(root)
        self.age_entry.pack()

        tk.Label(root, text="Course").pack()
        self.course_entry = tk.Entry(root)
        self.course_entry.pack()

        tk.Button(root, text="Add Student", command=self.add_student).pack(pady=5)
        tk.Button(root, text="Refresh List", command=self.refresh_list).pack(pady=5)
        tk.Button(root, text="Delete Selected", command=self.delete_selected).pack(pady=5)

        self.listbox = tk.Listbox(root)
        self.listbox.pack(fill=tk.BOTH, expand=True)

        self.refresh_list()

    def add_student(self):
        name = self.name_entry.get().strip()
        age = self.age_entry.get().strip()
        course = self.course_entry.get().strip()

        if not (name and age.isdigit() and course):
            messagebox.showwarning("Input Error", "Enter valid details!")
            return

        add_student(name, int(age), course)
        self.refresh_list()
        self.name_entry.delete(0, tk.END)
        self.age_entry.delete(0, tk.END)
        self.course_entry.delete(0, tk.END)

    def refresh_list(self):
        self.listbox.delete(0, tk.END)
        for row in get_students():
            self.listbox.insert(tk.END, f"{row[0]} | {row[1]} | {row[2]} | {row[3]}")

    def delete_selected(self):
        try:
            selected = self.listbox.get(self.listbox.curselection())
            student_id = selected.split(" | ")[0]
            delete_student(student_id)
            self.refresh_list()
        except:
            messagebox.showwarning("Selection Error", "Select a student to delete!")

# ------------------ Run ------------------
if __name__ == "__main__":
    create_table()
    root = tk.Tk()
    app = StudentApp(root)
    root.mainloop()
