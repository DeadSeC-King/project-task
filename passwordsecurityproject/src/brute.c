#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "brute.h"
#include <stdio.h>
#include <string.h>
#include <stdbool.h>

#define MAX_PASS_LEN 50

// Allowed characters for brute forcing
const char charset[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Recursive brute force function to generate passwords and compare
bool brute_force(char *guess, int pos, int max_len, const char *target) {
    if (pos == max_len) {
        guess[pos] = '\0';
        if (strcmp(guess, target) == 0) {
            return true;  // Found the password
        }
        return false;
    }

    for (int i = 0; i < (int)strlen(charset); i++) {
        guess[pos] = charset[i];
        if (brute_force(guess, pos + 1, max_len, target)) {
            return true;
        }
    }
    return false;
}

void bpc() {
    printf("Enter username to crack: ");
    char username[50];
    scanf("%49s", username);

    FILE *file = fopen("creds.txt", "r");
    if (!file) {
        printf("Error: creds.txt not found.\n");
        return;
    }

    char user[50], pass[50];
    int found = 0;

    while (fscanf(file, "%49s %49s", user, pass) != EOF) {
        if (strcmp(user, username) == 0) {
            found = 1;
            printf("\nCredential Found!\n");
            printf("User: %s\n", user);
            printf("Starting brute-force cracking...\n");

            char guess[MAX_PASS_LEN + 1];
            int pass_len = strlen(pass);

            if (brute_force(guess, 0, pass_len, pass)) {
                printf("Password cracked! Password is: %s\n", guess);
            } else {
                printf("Failed to crack the password.\n");
            }

            break;
        }
    }

    if (!found) {
        printf("User not found in database.\n");
    }

    fclose(file);
}

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void show_banner() {
    printf("=============================================\n");
    printf("        HASH SECURITY DEMO (MOCK MODE)       \n");
    printf("        Hashcat Integration Showcase         \n");
    printf("=============================================\n\n");
}

int main() {
    show_banner();

    printf("[+] Initializing Hashcat engine...\n");
    printf("[+] Hashcat version: 6.2.x (simulated)\n");
    printf("[+] Status: READY\n\n");

    char hash_file[100] = "sample_hashes.txt";
    printf("[+] Loading hash file: %s\n", hash_file);

    char attack_mode[50] = "Brute-force (Mock)";
    printf("[+] Selected Attack Mode: %s\n", attack_mode);

    char wordlist[100] = "wordlist.txt";
    printf("[+] Using Wordlist: %s (simulation only)\n\n", wordlist);

    printf("[+] Starting Hashcat...\n");
    printf("[+] Cracking in progress...\n");
  

    // Fake delay
    for (int i = 0; i < 3; i++) {
        printf(".");
        fflush(stdout);
        #ifdef _WIN32
            Sleep(500);
        #else
            usleep(500000);
        #endif
    }
    printf("\n\n");


    printf("[+] Exiting Hashcat demo.\n");
    printf("=============================================\n");
    return 0;
}
