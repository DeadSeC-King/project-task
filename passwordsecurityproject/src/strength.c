#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include "strength.h"

char list[100];
int count;

void psg(void) {
    char pp[100];

    printf("-- Enter your password to measure strength -- ");
    scanf("%99s", pp);

    int length = strlen(pp);
    for (int i = 0; i < length; ++i)
        list[i] = pp[i];

    list[length] = '\0';
    count = length;

    psgc();
}

void psgc(void) {
    int hasUpper = 0, hasLower = 0, hasDigit = 0, hasSpecial = 0;
    int repetition_penalty = 0;

    for (int i = 0; i < count; ++i) {
        unsigned char ch = list[i];

        if (isupper(ch)) hasUpper = 1;
        else if (islower(ch)) hasLower = 1;
        else if (isdigit(ch)) hasDigit = 1;
        else hasSpecial = 1;

        if (i + 2 < count && list[i] == list[i+1] && list[i] == list[i+2])
            repetition_penalty = 1;
    }

    int score = 0;
    if (count >= 12) score += 2;
    else if (count >= 8) score += 1;

    score += hasLower + hasUpper + hasDigit + hasSpecial;
    if ((hasLower + hasUpper + hasDigit + hasSpecial) >= 3) score += 1;
    if (repetition_penalty) score -= 1;

    if (score <= 1)
        printf("Very Weak password (score %d)\n", score);
    else if (score <= 3)
        printf("Weak password (score %d)\n", score);
    else if (score <= 5)
        printf("Medium password (score %d)\n", score);
    else
        printf("Strong password (score %d)\n", score);
}
