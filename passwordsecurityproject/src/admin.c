#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "admin.h"

struct creds {
    char id[50];
    char pass[50];
};

void admset(void) {
    printf("Press Y to add username & password and N to skip: ");

    char ch;
    scanf(" %c", &ch);

    if (ch == 'Y' || ch == 'y') {
        struct creds new_cred;

        printf("Enter new username: ");
        scanf("%49s", new_cred.id);

        printf("Enter new password: ");
        scanf("%49s", new_cred.pass);

        FILE *file = fopen("creds.txt", "a");
        if (!file) {
            printf("Error opening file.\n");
            return;
        }

        fprintf(file, "%s %s\n", new_cred.id, new_cred.pass);
        fclose(file);

        printf("Credentials saved to creds.txt\n");
    }
    else {
        printf("No changes made.\n");
    }
}
