package com.back.global.initdata;

import com.back.standard.cmd.CmdUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Profile("dev")
@RequiredArgsConstructor
@Configuration
public class DevInitData {
    @Bean
    ApplicationRunner devInitDataApplicationRunner() {
        return args -> {
            String projectRoot = System.getProperty("user.dir");
            String outputPath = projectRoot + "/frontend/src/global/backend/apiV1/schema.d.ts";
            CmdUtil.cmd.runAsync(
                    "npx{{DOT_CMD}}",
                    "--yes",
                    "--package", "typescript",
                    "--package", "openapi-typescript",
                    "openapi-typescript", "http://localhost:8080/v3/api-docs/apiV1",
                    "-o", outputPath,
                    "--properties-required-by-default"
            );
        };
    }
}
