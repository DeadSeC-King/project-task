# ===============================
#   MAKEFILE FOR C PROJECT
#   autorun system for password security application
# ===============================

CC = gcc
CFLAGS = -I include -Wall -Wextra

SRC = src/main.c src/strength.c src/generator.c src/brute.c src/admin.c
OBJ = $(SRC:.c=.o)

OUT = project

all: $(OUT)

$(OUT): $(OBJ)
	$(CC) $(OBJ) -o $(OUT)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

run: $(OUT)
	./$(OUT)

clean:
	rm -f $(OBJ) $(OUT)

rebuild: clean all
