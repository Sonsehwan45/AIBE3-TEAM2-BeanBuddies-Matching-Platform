package com.back.domain.client.client.service;

import com.back.domain.client.client.entity.Client;
import com.back.domain.client.client.repository.ClientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    public Client findById(Long id) {
        return clientRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("존재하지 않는 클라이언트입니다."));
    }

    @Transactional
    public Client updateClient(Long id, String companySize, String companyDescription, String representative,
                               String businessNo, String companyPhone, String companyEmail) {
        Client client = findById(id);
        client.update(companySize, companyDescription, representative, businessNo, companyPhone, companyEmail);

        return clientRepository.save(client);
    }
}
