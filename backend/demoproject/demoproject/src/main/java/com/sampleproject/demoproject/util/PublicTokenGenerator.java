package com.sampleproject.demoproject.util;

import java.security.SecureRandom;
import java.util.Base64;

public final class PublicTokenGenerator {

    private static final SecureRandom RANDOM =
            new SecureRandom();

    private PublicTokenGenerator() {
    }

    public static String generate() {

        byte[] bytes = new byte[24];

        RANDOM.nextBytes(bytes);

        return "pf_" +
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(bytes);
    }
}