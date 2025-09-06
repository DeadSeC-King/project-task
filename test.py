import customtkinter as ctk
from PIL import Image

# ===== Theme Settings =====
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

root = ctk.CTk()
root.title("AUTOCOLY.AI")
root.geometry("480x580")
# ===== Load & set background image =====
bg_image_pil = Image.open(r"C:\Users\Win11\pip.jpg")
bg_image_pil = bg_image_pil.resize((480, 580))
bg_image = ctk.CTkImage(light_image=bg_image_pil, size=(480, 580))

bg_label = ctk.CTkLabel(root, image=bg_image, text="")
bg_label.place(x=0, y=0, relwidth=1, relheight=1)
# ===== Styled Login Card =====
login_frame = ctk.CTkFrame(
    root,
    fg_color="#1a1a1a",         # Dark gray background
    corner_radius=20,
    border_color="#00e5ff",     # Neon cyan border
    border_width=3
)
login_frame.place(relx=0.5, rely=0.5, anchor="center")
#title
title_label = ctk.CTkLabel(
    login_frame,
    text="Login to AUTOCOLY.AI",
    font=("Arial", 24, "bold"),
    text_color="#00e5ff"
)
title_label.pack(pady=(25, 10))
# Username
username_entry = ctk.CTkEntry(
    login_frame,
    placeholder_text="Username",
    width=300,
    height=40,
    corner_radius=10,
    border_color="#00e5ff",
    fg_color="#262626",
    text_color="white",
    placeholder_text_color="#888"
)
username_entry.pack(pady=10, padx=20)

# Password
password_entry = ctk.CTkEntry(
    login_frame,
    placeholder_text="Password",
    show="*",
    width=300,
    height=40,
    corner_radius=10,
    border_color="#00e5ff",
    fg_color="#262626",
    text_color="white",
    placeholder_text_color="#888"
)
password_entry.pack(pady=10, padx=20)
# ===== Login Message Label =====
login_message = ctk.CTkLabel(login_frame, text="", font=("Arial", 14))
login_message.pack(pady=(10, 0))  # moved closer to button
root.mainloop()

