package dev.danielk.memberservice.member;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "shipping_addresses")
@EntityListeners(AuditingEntityListener.class)
public class AddressEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private MemberEntity member;

    @Column(nullable = false)
    private String nickname;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String zipCode;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public AddressEntity(Long id, MemberEntity member, String nickname, String address, String zipCode) {
        this.id = id;
        this.member = member;
        this.nickname = nickname;
        this.address = address;
        this.zipCode = zipCode;
    }

    public static AddressEntity from(Address address, MemberEntity member) {
        return new AddressEntity(address.id(), member, address.nickname(), address.address(), address.zipCode());
    }

    public Address toDomain() {
        return new Address(id, nickname, address, zipCode);
    }

    public void update(String nickname, String address, String zipCode) {
        this.nickname = nickname;
        this.address = address;
        this.zipCode = zipCode;
    }
}
