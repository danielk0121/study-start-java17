package dev.danielk.memberservice.product;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandJpaRepository extends JpaRepository<BrandEntity, Long> {
}
