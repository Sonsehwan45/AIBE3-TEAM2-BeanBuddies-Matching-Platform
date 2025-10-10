package com.back.domain.client.client.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.handler;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.back.domain.client.client.entity.Client;
import com.back.domain.client.client.service.ClientService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ClientControllerTest {

    @Autowired
    private MockMvc mvc;
    @Autowired
    private ClientService clientService;

    @Test
    @DisplayName("프리랜서 정보 업데이트 - 성공")
    void t1() throws Exception {
        Long id = 2L;
        Client client = clientService.findById(2L);

        ResultActions resultActions = mvc
                .perform(
                        put("/api/v1/clients/{id}", id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                                "companySize" : "대기업",
                                                "companyDescription" : "안녕하세요",
                                                "representative" : "김대표",
                                                "businessNo" : "1232131-123123",
                                                "companyPhone" : "010-1234-5678",
                                                "companyEmail" : "myEmail@email.com"
                                        }
                                        """)
                )
                .andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(ClientController.class))
                .andExpect(handler().methodName("updateClient"))

                //상태 코드 확인
                .andExpect(status().isNoContent())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("204"))
                .andExpect(jsonPath("$.msg").value("클라이언트 정보 변경"))
                .andExpect(jsonPath("$.data.id").value(id))
                .andExpect(jsonPath("$.data.companySize").value("대기업"))
                .andExpect(jsonPath("$.data.companyDescription").value("안녕하세요"))
                .andExpect(jsonPath("$.data.representative").value("김대표"))
                .andExpect(jsonPath("$.data.businessNo").value("1232131-123123"))
                .andExpect(jsonPath("$.data.companyPhone").value("010-1234-5678"))
                .andExpect(jsonPath("$.data.companyEmail").value("myEmail@email.com"));
    }
}