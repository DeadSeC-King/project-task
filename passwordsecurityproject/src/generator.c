#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include <string.h>
#include "generator.h"

void pg(void) {
    char pool[] = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$^&*";

    srand(time(NULL));
    int length = (rand() % 2 == 0) ? 8 : 12;

    char password[20];

    for (int i = 0; i < length; i++)
        password[i] = pool[rand() % strlen(pool)];

    password[length] = '\0';

    printf("Generated Password (%d chars): %s\n", length, password);
}
