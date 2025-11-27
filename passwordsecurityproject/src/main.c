#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "strength.h"
#include "generator.h"
#include "brute.h"
#include "admin.h"

void code(void); // menu

int main(void) {
    char a[] = "kushagra";
    char b[] = "1234abcd";
    char user[30];
    char ps[30];

    printf("****---LOGIN---****\n");
    printf("Enter Username: ");
    scanf("%29s", user);

    if (strcmp(user, a) == 0) {
        printf("Enter Password: ");
        scanf("%29s", ps);

        if (strcmp(ps, b) == 0) {
            printf("\nLogin successful!\n");
            code();
        } else {
            printf("\nInvalid password.\n");
        }
    } else {
        printf("\nInvalid username. Retry.\n");
    }

    return 0;
}

void code(void) {
    int g;

    while (1) {
        printf("\n--- Select the number to use a feature ---\n");
        printf("1. Password Strength Checker\n");
        printf("2. Password Generator\n");
        printf("3. Bruteforce Password Checker\n");
        printf("4. End the program\n");
        printf("5. admin settings\n");
        printf("Your choice: ");

        if (scanf("%d", &g) != 1) {
            printf("Invalid input (not a number).\n");
            while (getchar() != '\n');
            continue;
        }

        switch (g) {
            case 1: psg(); break;
            case 2: pg(); break;
            case 3: bpc(); break;
            case 4: exit(0);
            case 5: admset(); break;
            default: printf("Invalid input.\n");
        }
    }
}
