package dev.danielk.memberservice.member;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressJpaRepository extends JpaRepository<AddressEntity, Long> {
    List<AddressEntity> findByMemberId(Long memberId);
}
