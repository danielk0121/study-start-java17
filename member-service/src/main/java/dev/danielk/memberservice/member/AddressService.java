package dev.danielk.memberservice.member;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class AddressService {

    private final AddressJpaRepository addressRepository;
    private final MemberJpaRepository memberRepository;

    public List<Address> findByMemberId(Long memberId) {
        return addressRepository.findByMemberId(memberId).stream()
                .map(AddressEntity::toDomain)
                .toList();
    }

    @Transactional
    public Address create(Long memberId, Address address) {
        MemberEntity member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다. id=" + memberId));
        
        AddressEntity entity = AddressEntity.from(address, member);
        return addressRepository.save(entity).toDomain();
    }

    @Transactional
    public Address update(Long addressId, Address address) {
        AddressEntity entity = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 배송지입니다. id=" + addressId));
        
        entity.update(address.nickname(), address.address(), address.zipCode());
        return entity.toDomain();
    }

    @Transactional
    public void delete(Long addressId) {
        addressRepository.deleteById(addressId);
    }

    public Address findById(Long addressId) {
        return addressRepository.findById(addressId)
                .map(AddressEntity::toDomain)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 배송지입니다. id=" + addressId));
    }
}
