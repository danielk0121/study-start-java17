package dev.danielk.memberservice.member;

import org.springframework.data.jpa.repository.JpaRepository;

interface MemberJpaRepository extends JpaRepository<MemberEntity, Long> {
}
