import customtkinter as ctk
from tkinter import Scrollbar, Text, END
import json
import os
import random
import math

# --- 1. CONFIGURATION AND INITIAL DATA ---
SAVE_FILE = "solo_leveling_profile.json"
INITIAL_STATS = {
    "Intelligence": 5, "Focus": 5, "Memory": 5, "Logic": 5, "Creativity": 5
}
INITIAL_SUBJECTS = {
    "C Programming": {"difficulty": 1.2, "unlock_skill": "DSA"},
    "Mathematics": {"difficulty": 1.1, "unlock_skill": "Logic"}, # Used as a Subject, unlocks the Stat 'Logic' improvement speed
    "Python": {"difficulty": 1.0, "unlock_skill": "Python"},
    "Networks": {"difficulty": 1.5, "unlock_skill": "Cyber Security"},
    "OS Fundamentals": {"difficulty": 1.3, "unlock_skill": "Linux"},
    "DBMS & SQL": {"difficulty": 1.1, "unlock_skill": "Shell Scripting"}
}
INITIAL_SKILLS = {
    "Python": {"passive": "Coding Speed +5%", "req": {"subject": "Python", "level": 3}},
    "Linux": {"passive": "Shell Scripting EXP +10%", "req": {"stat": "Focus", "level": 15}},
    "DSA": {"passive": "Logic Stat Gain +10%", "req": {"subject": "C Programming", "level": 5}},
    "Cyber Security": {"passive": "Risk Assessment +5%", "req": {"subject": "Networks", "level": 5}},
    "Hacking Basics": {"passive": "Critical Study Chance +2%", "req": {"skill": "Cyber Security", "level": 5}},
    "Shell Scripting": {"passive": "Automation Efficiency +5%", "req": {"subject": "DBMS & SQL", "level": 3}}
}

# Set appearance mode and color theme
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

# --- 2. CORE GAME CLASSES ---

class ExperienceSystem:
    """Handles all EXP and Leveling calculations."""
    
    @staticmethod
    def calculate_required_exp(level):
        """Calculates the EXP needed for the next level (exponential curve)."""
        if level <= 1:
            return 1000
        # Formula: Base + (Level^2 * 500) * Difficulty Modifier
        # This creates a steep, but manageable, exponential curve like Solo Leveling
        return int(1000 + (level ** 2) * 500 * (1 + level / 100.0))

    @staticmethod
    def get_max_level():
        """Define a hypothetical max level for subjects/skills."""
        return 100

class Entity:
    """Base class for Subject and Skill to handle common leveling logic."""
    
    def __init__(self, name):
        self.name = name
        self.level = 1
        self.exp = 0
        self.max_level = ExperienceSystem.get_max_level()

    def get_required_exp(self):
        """Required EXP for the next level using the common system."""
        if self.level >= self.max_level:
            return 0
        # Use a slightly flatter curve for skills/subjects
        return int(self.level * 500 * (1.1 + (self.level / 50)))

    def add_exp(self, amount):
        """Adds EXP and handles level-up."""
        if self.level >= self.max_level:
            return 0, 0 # Returns (levels_gained, overflow_exp)

        self.exp += amount
        levels_gained = 0
        overflow_exp = 0

        while self.exp >= self.get_required_exp() and self.level < self.max_level:
            self.exp -= self.get_required_exp()
            self.level += 1
            levels_gained += 1
        
        overflow_exp = self.exp
        if self.level >= self.max_level:
            self.exp = 0 # Cap EXP at max level

        return levels_gained, overflow_exp
    
    def to_json(self):
        return {"level": self.level, "exp": self.exp}

    def from_json(self, data):
        self.level = data.get("level", 1)
        self.exp = data.get("exp", 0)

class Subject(Entity):
    """Represents a Subject area (e.g., 'Python', 'Networks')."""
    
    def __init__(self, name, config):
        super().__init__(name)
        self.difficulty = config["difficulty"]
        self.unlock_skill = config.get("unlock_skill")
        self.max_level = 10 # Cap subjects at a lower level for milestone unlocks

class Skill(Entity):
    """Represents a Skill (e.g., 'DSA', 'Cyber Security')."""
    
    def __init__(self, name, config):
        super().__init__(name)
        self.passive_bonus = config["passive"]
        self.requirement = config["req"]
        self.is_unlocked = False

    def check_requirements(self, player_stats, subjects, skills):
        """Checks if the skill can be unlocked based on requirements."""
        req_type = list(self.requirement.keys())[0]
        req_name = self.requirement[req_type]
        req_level = self.requirement["level"]
        
        if req_type == "subject":
            if subjects.get(req_name) and subjects[req_name].level >= req_level:
                return True
        elif req_type == "stat":
            if player_stats.get(req_name) and player_stats[req_name] >= req_level:
                return True
        elif req_type == "skill":
            if skills.get(req_name) and skills[req_name].is_unlocked and skills[req_name].level >= req_level:
                return True
        return False
    
    def to_json(self):
        data = super().to_json()
        data["is_unlocked"] = self.is_unlocked
        return data

    def from_json(self, data):
        super().from_json(data)
        self.is_unlocked = data.get("is_unlocked", False)

class Player:
    """The main character profile."""
    
    def __init__(self, name="Sung Jin-Woo"):
        self.name = name
        self.level = 1
        self.exp = 0
        self.stat_points = 0
        self.skill_points = 0
        self.stats = INITIAL_STATS.copy()
        
    def get_required_exp(self):
        """Uses the general exponential curve for the Player's level."""
        return ExperienceSystem.calculate_required_exp(self.level)

    def add_exp(self, amount):
        """Adds EXP and handles player level-up."""
        self.exp += amount
        levels_gained = 0
        
        while self.exp >= self.get_required_exp():
            self.exp -= self.get_required_exp()
            self.level += 1
            self.stat_points += 5 # Gain 5 stat points per level
            self.skill_points += 1 # Gain 1 skill point per level (for future use/advanced skills)
            levels_gained += 1
            
        return levels_gained

    def allocate_stat(self, stat_name):
        """Spends a stat point to increase a stat."""
        if self.stat_points > 0 and stat_name in self.stats:
            self.stats[stat_name] += 1
            self.stat_points -= 1
            return True
        return False
    
    def to_json(self):
        return {
            "name": self.name,
            "level": self.level,
            "exp": self.exp,
            "stat_points": self.stat_points,
            "skill_points": self.skill_points,
            "stats": self.stats
        }

    def from_json(self, data):
        self.name = data.get("name", "Sung Jin-Woo")
        self.level = data.get("level", 1)
        self.exp = data.get("exp", 0)
        self.stat_points = data.get("stat_points", 0)
        self.skill_points = data.get("skill_points", 0)
        self.stats = data.get("stats", INITIAL_STATS.copy())


class GameManager:
    """Manages game state, actions, and persistence."""
    
    def __init__(self):
        self.player = Player()
        self.subjects = {}
        self.skills = {}
        self.log_messages = []
        self.load_profile()

        # If loading was unsuccessful or file didn't exist, initialize fresh
        if not self.subjects:
            self.initialize_new_game()
    
    def initialize_new_game(self):
        """Sets up initial subjects and skills."""
        self.player = Player()
        self.subjects = {
            name: Subject(name, config) 
            for name, config in INITIAL_SUBJECTS.items()
        }
        self.skills = {
            name: Skill(name, config)
            for name, config in INITIAL_SKILLS.items()
        }

    # --- Persistence ---
    def save_profile(self):
        """Saves player, subjects, and skills data to a JSON file."""
        data = {
            "player": self.player.to_json(),
            "subjects": {name: s.to_json() for name, s in self.subjects.items()},
            "skills": {name: s.to_json() for name, s in self.skills.items()}
        }
        try:
            with open(SAVE_FILE, 'w') as f:
                json.dump(data, f, indent=4)
            self.add_log(f"Profile saved to {SAVE_FILE}.")
        except Exception as e:
            self.add_log(f"ERROR: Failed to save profile. {e}")

    def load_profile(self):
        """Loads data from the JSON file."""
        if os.path.exists(SAVE_FILE):
            try:
                with open(SAVE_FILE, 'r') as f:
                    data = json.load(f)
                
                self.player.from_json(data.get("player", {}))

                # Load Subjects
                loaded_subjects = data.get("subjects", {})
                for name, config in INITIAL_SUBJECTS.items():
                    subj = Subject(name, config)
                    if name in loaded_subjects:
                        subj.from_json(loaded_subjects[name])
                    self.subjects[name] = subj

                # Load Skills
                loaded_skills = data.get("skills", {})
                for name, config in INITIAL_SKILLS.items():
                    skill = Skill(name, config)
                    if name in loaded_skills:
                        skill.from_json(loaded_skills[name])
                    self.skills[name] = skill
                    
                self.add_log(f"Profile loaded from {SAVE_FILE}.")
                return True
            except Exception as e:
                self.add_log(f"ERROR: Failed to load profile. Starting new game. {e}")
                return False
        return False

    # --- Log Management ---
    def add_log(self, message):
        """Adds a timestamped message to the log."""
        import time
        timestamp = time.strftime("[%H:%M:%S]")
        log_entry = f"{timestamp} {message}"
        self.log_messages.append(log_entry)
        # Keep log concise
        if len(self.log_messages) > 100:
            self.log_messages = self.log_messages[-100:]

    def get_log(self):
        """Returns the log messages as a single string."""
        return "\n".join(self.log_messages)

    # --- Core Mechanics ---
    def apply_random_event(self, base_exp):
        """Applies a random event modifier to the EXP gain."""
        events = {
            "Fatigue": 0.5,
            "Normal Day": 1.0,
            "Boost": 1.5,
            "Critical Study!": 2.5,
            "Flow State! (Rare)": 4.0
        }
        
        # Adjust probabilities based on Creativity and Focus
        # Creativity boosts critical chance, Focus reduces fatigue chance
        boost_chance = 0.05 + (self.player.stats["Creativity"] / 500.0)
        fatigue_chance = 0.20 - (self.player.stats["Focus"] / 500.0)
        
        event_roll = random.random()
        event_name = "Normal Day"
        multiplier = 1.0
        
        if event_roll < max(0.05, fatigue_chance):
            event_name = "Fatigue"
            multiplier = events[event_name]
        elif event_roll > (0.95 - boost_chance) and event_roll <= 0.99:
            event_name = "Critical Study!"
            multiplier = events[event_name]
        elif event_roll > 0.99:
            event_name = "Flow State! (Rare)"
            multiplier = events[event_name]
        elif event_roll > 0.85:
            event_name = "Boost"
            multiplier = events[event_name]
            
        final_exp = int(base_exp * multiplier)
        
        return event_name, final_exp

    def check_skill_unlocks(self):
        """Checks for any new skill unlocks."""
        unlocked_count = 0
        for skill_name, skill in self.skills.items():
            if not skill.is_unlocked:
                if skill.check_requirements(self.player.stats, self.subjects, self.skills):
                    skill.is_unlocked = True
                    self.add_log(f"SKILL UNLOCKED: [{skill_name}]! {skill.passive_bonus}")
                    unlocked_count += 1
        return unlocked_count

    # --- Actions ---
    def study_subject(self, subject_name):
        """Performs a study action for a subject."""
        subject = self.subjects.get(subject_name)
        if not subject:
            return "ERROR: Subject not found."

        # Base EXP gain influenced by Intelligence and Subject Difficulty
        base_exp = 100 + (self.player.stats["Intelligence"] * 10)
        base_exp = int(base_exp / subject.difficulty)

        event_name, exp_gain = self.apply_random_event(base_exp)
        
        # Apply Logic stat bonus to EXP gain
        if self.player.stats["Logic"] > 10:
            exp_gain = int(exp_gain * (1 + (self.player.stats["Logic"] - 10) / 100.0))

        # Add EXP to player and subject
        player_levels = self.player.add_exp(int(exp_gain * 0.1)) # 10% of subject EXP as overall EXP
        subj_levels, overflow = subject.add_exp(exp_gain)
        
        # Log result
        log_msg = f"Studied {subject_name} ({event_name}). Gained {exp_gain} Subject EXP."
        if subj_levels > 0:
            log_msg += f" {subject_name} Level UP! ({subject.level})"
        if player_levels > 0:
            log_msg += f" Player Level UP! ({self.player.level})"
            
        self.add_log(log_msg)
        self.check_skill_unlocks()
        return log_msg

    def practice_skill(self, skill_name):
        """Performs a practice action for a skill."""
        skill = self.skills.get(skill_name)
        if not skill or not skill.is_unlocked:
            return "ERROR: Skill not found or locked."
        
        # Base EXP gain influenced by Focus and the skill's current level
        base_exp = 150 + (self.player.stats["Focus"] * 10) - (skill.level * 5)
        
        event_name, exp_gain = self.apply_random_event(base_exp)

        # Add EXP to player and skill
        player_levels = self.player.add_exp(int(exp_gain * 0.05)) # 5% of skill EXP as overall EXP
        skill_levels, overflow = skill.add_exp(exp_gain)
        
        # Log result
        log_msg = f"Practiced {skill_name} ({event_name}). Gained {exp_gain} Skill EXP."
        if skill_levels > 0:
            log_msg += f" {skill_name} Level UP! ({skill.level})"
        if player_levels > 0:
            log_msg += f" Player Level UP! ({self.player.level})"
            
        self.add_log(log_msg)
        self.check_skill_unlocks()
        return log_msg

    def grind_exp(self):
        """Grind general EXP (e.g., general life experience)."""
        # Base EXP influenced by Memory and overall Player Level
        base_exp = 500 + (self.player.stats["Memory"] * 5) + (self.player.level * 50)

        event_name, exp_gain = self.apply_random_event(base_exp)
        player_levels = self.player.add_exp(exp_gain)
        
        # Log result
        log_msg = f"Grinding Life EXP ({event_name}). Gained {exp_gain} overall EXP."
        if player_levels > 0:
            log_msg += f" Player Level UP! ({self.player.level})"
            
        self.add_log(log_msg)
        return log_msg
    
    def daily_quest(self):
        """A single, high-reward action per session (simulated)."""
        # High base EXP influenced by Creativity
        base_exp = 5000 + (self.player.stats["Creativity"] * 50)
        
        player_levels = self.player.add_exp(base_exp)
        self.player.stat_points += 2 # Bonus stat points
        
        # Random subject/skill boost
        target = random.choice(list(self.subjects.values()) + list(self.skills.values()))
        target_levels, overflow = target.add_exp(base_exp * 0.1)
        
        # Log result
        log_msg = f"Completed Daily Quest! Gained {base_exp} EXP and 2 Stat Points."
        if player_levels > 0:
            log_msg += f" Player Level UP! ({self.player.level})"
        if target_levels > 0:
             log_msg += f" Bonus: {target.name} Level UP! ({target.level})"
             
        self.add_log(log_msg)
        self.check_skill_unlocks()
        return log_msg

# --- 3. CUSTOM TKINTER UI (MAIN APPLICATION) ---

class MainApp(ctk.CTk):
    
    def __init__(self, manager):
        super().__init__()
        self.manager = manager
        self.title("Solo-Leveling Self-Upgrade System")
        self.geometry("1400x800")
        
        # Configure grid layout (3 columns for Left/Center/Right panels)
        self.grid_columnconfigure((0, 2), weight=1) # Left and Right panels
        self.grid_columnconfigure(1, weight=2) # Center panel is wider
        self.grid_rowconfigure(0, weight=1)

        self.create_widgets()
        self.update_ui()

    def create_widgets(self):
        # --- Left Panel: Player Profile and Stats ---
        self.left_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.left_frame.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")
        self.left_frame.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(self.left_frame, text="[Player Profile]", font=ctk.CTkFont(size=20, weight="bold")).grid(row=0, column=0, pady=(10, 5), sticky="w")
        
        self.name_label = ctk.CTkLabel(self.left_frame, text=f"Name: {self.manager.player.name}", font=ctk.CTkFont(size=16))
        self.name_label.grid(row=1, column=0, pady=2, sticky="w")
        
        self.level_label = ctk.CTkLabel(self.left_frame, text="Level: 1", font=ctk.CTkFont(size=16))
        self.level_label.grid(row=2, column=0, pady=2, sticky="w")
        
        # EXP Bar
        ctk.CTkLabel(self.left_frame, text="EXP Progress:", font=ctk.CTkFont(size=14)).grid(row=3, column=0, pady=(10, 0), sticky="w")
        self.exp_bar = ctk.CTkProgressBar(self.left_frame, height=15)
        self.exp_bar.grid(row=4, column=0, pady=(0, 5), sticky="ew")
        self.exp_label = ctk.CTkLabel(self.left_frame, text="0/1000 (0.0%)", font=ctk.CTkFont(size=12))
        self.exp_label.grid(row=5, column=0, pady=(0, 10), sticky="w")

        # Stat Points
        self.stat_points_label = ctk.CTkLabel(self.left_frame, text="Stat Points: 0", font=ctk.CTkFont(size=18, weight="bold"))
        self.stat_points_label.grid(row=6, column=0, pady=(15, 5), sticky="w")

        # Stats List
        ctk.CTkLabel(self.left_frame, text="[Stats]", font=ctk.CTkFont(size=20, weight="bold")).grid(row=7, column=0, pady=(10, 5), sticky="w")
        self.stat_labels = {}
        for i, stat in enumerate(self.manager.player.stats.keys()):
            frame = ctk.CTkFrame(self.left_frame, fg_color="transparent")
            frame.grid(row=8 + i, column=0, pady=2, sticky="ew")
            frame.grid_columnconfigure(0, weight=1)

            label = ctk.CTkLabel(frame, text=f"{stat}: {self.manager.player.stats[stat]}")
            label.grid(row=0, column=0, sticky="w")
            self.stat_labels[stat] = label

            ctk.CTkButton(frame, text="+", width=30, height=20, 
                          command=lambda s=stat: self.allocate_stat(s)).grid(row=0, column=1, padx=5)

        # --- Center Panel: Training Center and Log ---
        self.center_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.center_frame.grid(row=0, column=1, padx=20, pady=20, sticky="nsew")
        self.center_frame.grid_rowconfigure(1, weight=1) # Log box takes up space
        
        # Training Buttons
        ctk.CTkLabel(self.center_frame, text="[Training Center]", font=ctk.CTkFont(size=24, weight="bold")).grid(row=0, column=0, pady=(10, 15), sticky="n")
        
        # Action Buttons Frame
        self.action_frame = ctk.CTkFrame(self.center_frame)
        self.action_frame.grid(row=1, column=0, pady=10, sticky="ew")
        self.action_frame.grid_columnconfigure((0, 1), weight=1)
        
        # Action Button 1: Study Subject (Dropdown)
        ctk.CTkLabel(self.action_frame, text="Study Subject:", font=ctk.CTkFont(weight="bold")).grid(row=0, column=0, padx=10, pady=(10, 2), sticky="w")
        self.subject_dropdown = ctk.CTkOptionMenu(self.action_frame, values=list(self.manager.subjects.keys()), command=self.action_study)
        self.subject_dropdown.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="ew")
        
        # Action Button 2: Practice Skill (Dropdown)
        ctk.CTkLabel(self.action_frame, text="Practice Skill:", font=ctk.CTkFont(weight="bold")).grid(row=0, column=1, padx=10, pady=(10, 2), sticky="w")
        self.skill_dropdown = ctk.CTkOptionMenu(self.action_frame, values=list(self.manager.skills.keys()), command=self.action_practice)
        self.skill_dropdown.grid(row=1, column=1, padx=10, pady=(0, 10), sticky="ew")
        
        # Action Button 3: Grind EXP
        self.grind_button = ctk.CTkButton(self.action_frame, text="Grind EXP (General)", command=self.action_grind)
        self.grind_button.grid(row=2, column=0, columnspan=2, padx=10, pady=5, sticky="ew")
        
        # Action Button 4: Daily Quest
        self.daily_button = ctk.CTkButton(self.action_frame, text="[Daily Quest] - High Reward", command=self.action_daily, fg_color="#E74C3C")
        self.daily_button.grid(row=3, column=0, columnspan=2, padx=10, pady=(5, 10), sticky="ew")
        
        ctk.CTkButton(self.action_frame, text="Save Profile", command=self.manager.save_profile).grid(row=4, column=0, columnspan=2, padx=10, pady=(10, 15), sticky="ew")


        # Log Box
        ctk.CTkLabel(self.center_frame, text="[System Log]", font=ctk.CTkFont(size=20, weight="bold")).grid(row=2, column=0, pady=(10, 5), sticky="w")
        self.log_text = ctk.CTkTextbox(self.center_frame, height=350, wrap="word")
        self.log_text.grid(row=3, column=0, sticky="nsew", padx=10, pady=(0, 10))

        # --- Right Panel: Subjects and Skills Details ---
        self.right_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.right_frame.grid(row=0, column=2, padx=20, pady=20, sticky="nsew")
        self.right_frame.grid_columnconfigure(0, weight=1)
        self.right_frame.grid_rowconfigure(1, weight=1)
        self.right_frame.grid_rowconfigure(3, weight=1)

        # Subjects List
        ctk.CTkLabel(self.right_frame, text="[Subjects Module]", font=ctk.CTkFont(size=20, weight="bold")).grid(row=0, column=0, pady=(10, 5), sticky="w")
        self.subject_scroll_frame = ctk.CTkScrollableFrame(self.right_frame, label_text="Academics")
        self.subject_scroll_frame.grid(row=1, column=0, sticky="nsew", pady=10)
        self.subject_widgets = {}

        # Skills List
        ctk.CTkLabel(self.right_frame, text="[Skills Module]", font=ctk.CTkFont(size=20, weight="bold")).grid(row=2, column=0, pady=(10, 5), sticky="w")
        self.skill_scroll_frame = ctk.CTkScrollableFrame(self.right_frame, label_text="Abilities")
        self.skill_scroll_frame.grid(row=3, column=0, sticky="nsew", pady=10)
        self.skill_widgets = {}
        
        self.draw_subjects_and_skills()
        self.update_log_box()

    def draw_subjects_and_skills(self):
        """Initial draw of the subject and skill lists."""
        
        # Clear existing widgets
        for widget in self.subject_scroll_frame.winfo_children():
            widget.destroy()
        for widget in self.skill_scroll_frame.winfo_children():
            widget.destroy()
            
        # Draw Subjects
        self.subject_scroll_frame.grid_columnconfigure(0, weight=1)
        for i, (name, subj) in enumerate(self.manager.subjects.items()):
            frame = ctk.CTkFrame(self.subject_scroll_frame, border_width=1, border_color="#555")
            frame.grid(row=i, column=0, padx=5, pady=5, sticky="ew")
            frame.grid_columnconfigure(0, weight=1)
            
            level_label = ctk.CTkLabel(frame, text=f"{name} (Lv. {subj.level}/{subj.max_level})", font=ctk.CTkFont(weight="bold"))
            level_label.grid(row=0, column=0, sticky="w", padx=5, pady=(5, 0))
            
            exp_bar = ctk.CTkProgressBar(frame, height=10)
            exp_bar.grid(row=1, column=0, sticky="ew", padx=5, pady=(0, 2))
            
            exp_text = ctk.CTkLabel(frame, text="0/0 (0%)", font=ctk.CTkFont(size=10))
            exp_text.grid(row=2, column=0, sticky="w", padx=5, pady=(0, 5))
            
            self.subject_widgets[name] = {"level": level_label, "bar": exp_bar, "text": exp_text}
            self.update_subject_widget(name, subj)

        # Draw Skills
        self.skill_scroll_frame.grid_columnconfigure(0, weight=1)
        for i, (name, skill) in enumerate(self.manager.skills.items()):
            frame = ctk.CTkFrame(self.skill_scroll_frame, border_width=1, border_color="#555")
            frame.grid(row=i, column=0, padx=5, pady=5, sticky="ew")
            frame.grid_columnconfigure(0, weight=1)
            
            status_color = "#2ECC71" if skill.is_unlocked else "#E74C3C"
            status_text = "UNLOCKED" if skill.is_unlocked else "LOCKED"
            
            level_label = ctk.CTkLabel(frame, text=f"{name} (Lv. {skill.level}) - {status_text}", 
                                        font=ctk.CTkFont(weight="bold"), text_color=status_color)
            level_label.grid(row=0, column=0, sticky="w", padx=5, pady=(5, 0))
            
            passive_label = ctk.CTkLabel(frame, text=f"Passive: {skill.passive_bonus}")
            passive_label.grid(row=1, column=0, sticky="w", padx=5)
            
            if not skill.is_unlocked:
                req_type = list(skill.requirement.keys())[0]
                req_val = skill.requirement[req_type]
                req_text = f"Requirement: {req_val} {req_type.capitalize()} Lv. {skill.requirement['level']}"
                req_label = ctk.CTkLabel(frame, text=req_text, font=ctk.CTkFont(size=10, slant="italic"))
                req_label.grid(row=2, column=0, sticky="w", padx=5)
                
            exp_bar = ctk.CTkProgressBar(frame, height=10)
            exp_bar.grid(row=3, column=0, sticky="ew", padx=5, pady=(5, 2))
            
            exp_text = ctk.CTkLabel(frame, text="0/0 (0%)", font=ctk.CTkFont(size=10))
            exp_text.grid(row=4, column=0, sticky="w", padx=5, pady=(0, 5))

            self.skill_widgets[name] = {"level": level_label, "bar": exp_bar, "text": exp_text}
            self.update_skill_widget(name, skill)

    # --- UI Update Methods ---
    def update_log_box(self):
        """Updates the log box with new messages."""
        self.log_text.delete("1.0", END)
        self.log_text.insert(END, self.manager.get_log())
        self.log_text.see(END) # Scroll to the bottom

    def update_player_stats(self):
        """Updates the Player Profile panel."""
        player = self.manager.player
        
        # Player Info
        self.level_label.configure(text=f"Level: {player.level}")
        self.stat_points_label.configure(text=f"Stat Points: {player.stat_points}")
        
        # EXP Bar
        required_exp = player.get_required_exp()
        progress = min(1.0, player.exp / required_exp) if required_exp > 0 else 1.0
        percent = progress * 100
        self.exp_bar.set(progress)
        self.exp_label.configure(text=f"{player.exp}/{required_exp} ({percent:.1f}%)")
        
        # Stats List
        for stat, value in player.stats.items():
            self.stat_labels[stat].configure(text=f"{stat}: {value}")

    def update_subject_widget(self, name, subj):
        """Updates a single Subject's details widget."""
        widget = self.subject_widgets.get(name)
        if not widget: return

        required_exp = subj.get_required_exp()
        progress = min(1.0, subj.exp / required_exp) if required_exp > 0 else 1.0
        percent = progress * 100

        widget["level"].configure(text=f"{name} (Lv. {subj.level}/{subj.max_level})")
        widget["bar"].set(progress)
        widget["text"].configure(text=f"{subj.exp}/{required_exp} ({percent:.1f}%)")

    def update_skill_widget(self, name, skill):
        """Updates a single Skill's details widget."""
        widget = self.skill_widgets.get(name)
        if not widget: return
        
        required_exp = skill.get_required_exp()
        progress = min(1.0, skill.exp / required_exp) if required_exp > 0 else 1.0
        percent = progress * 100

        status_color = "#2ECC71" if skill.is_unlocked else "#E74C3C"
        status_text = "UNLOCKED" if skill.is_unlocked else "LOCKED"
        
        widget["level"].configure(text=f"{name} (Lv. {skill.level}) - {status_text}", text_color=status_color)
        widget["bar"].set(progress)
        widget["text"].configure(text=f"{skill.exp}/{required_exp} ({percent:.1f}%)")
        
        # Disable practice action for locked skills
        if not skill.is_unlocked and self.skill_dropdown.get() == name:
            self.skill_dropdown.set(list(self.manager.skills.keys())[0])


    def update_ui(self):
        """Runs all necessary updates after an action."""
        self.update_player_stats()
        self.update_log_box()
        
        # Update Subjects and Skills
        for name, subj in self.manager.subjects.items():
            self.update_subject_widget(name, subj)
        for name, skill in self.manager.skills.items():
            self.update_skill_widget(name, skill)
            
        # Update dropdowns in case new skills were unlocked
        unlocked_skills = [name for name, skill in self.manager.skills.items() if skill.is_unlocked]
        self.skill_dropdown.configure(values=unlocked_skills if unlocked_skills else ["(No Skills Unlocked)"])
        
        # Ensure the selected option is valid
        if self.subject_dropdown.get() not in self.manager.subjects:
            self.subject_dropdown.set(list(self.manager.subjects.keys())[0])
            
        if self.skill_dropdown.get() not in unlocked_skills and unlocked_skills:
            self.skill_dropdown.set(unlocked_skills[0])
        elif not unlocked_skills:
            self.skill_dropdown.set("(No Skills Unlocked)")
            

    # --- UI Actions Bound to GameManager ---
    def allocate_stat(self, stat_name):
        """Action to allocate a stat point."""
        if self.manager.player.allocate_stat(stat_name):
            self.manager.add_log(f"Allocated 1 point to {stat_name}. New value: {self.manager.player.stats[stat_name]}")
            self.update_ui()
        else:
            self.manager.add_log("ERROR: No Stat Points available to allocate.")
            self.update_log_box()

    def action_study(self, subject_name):
        """Action for Study button."""
        self.manager.study_subject(subject_name)
        self.update_ui()

    def action_practice(self, skill_name):
        """Action for Practice button."""
        skill = self.manager.skills.get(skill_name)
        if skill and skill.is_unlocked:
            self.manager.practice_skill(skill_name)
        else:
            self.manager.add_log(f"Cannot practice {skill_name}: Not yet unlocked.")
        self.update_ui()

    def action_grind(self):
        """Action for Grind EXP button."""
        self.manager.grind_exp()
        self.update_ui()

    def action_daily(self):
        """Action for Daily Quest button."""
        self.manager.daily_quest()
        self.update_ui()

if __name__ == "__main__":
    game_manager = GameManager()
    app = MainApp(game_manager)
    
    # Save on closing
    def on_closing():
        game_manager.save_profile()
        app.destroy()
        
    app.protocol("WM_DELETE_WINDOW", on_closing)
    app.mainloop()