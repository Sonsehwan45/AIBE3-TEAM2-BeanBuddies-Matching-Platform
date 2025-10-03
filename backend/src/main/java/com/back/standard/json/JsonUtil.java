package com.back.standard.json;

import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtil {
    public static ObjectMapper objectMapper = new ObjectMapper();

    public static String toString(Object obj) {
        return toString(obj, null);
    }

    public static String toString(Object obj, String defaultValue) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
