package dev.danielk.memberservice.product;

import lombok.RequiredArgsConstructor;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService service;
    private final ProductMapper mapper;

    public record RegisterRequest(@NotBlank(message = "상품명은 필수입니다.") String name,
                                  @NotNull(message = "가격은 필수입니다.") @Positive(message = "가격은 0보다 커야 합니다.") BigDecimal price,
                                  @Min(value = 0, message = "재고는 0 이상이어야 합니다.") int stock,
                                  @NotBlank(message = "카테고리는 필수입니다.") String category) {}
    public record UpdateRequest(@NotBlank(message = "상품명은 필수입니다.") String name,
                                @NotNull(message = "가격은 필수입니다.") @Positive(message = "가격은 0보다 커야 합니다.") BigDecimal price,
                                @Min(value = 0, message = "재고는 0 이상이어야 합니다.") int stock,
                                @NotBlank(message = "카테고리는 필수입니다.") String category) {}
    public record ProductResponse(Long id, String name, BigDecimal price, int stock, String category,
                                      OffsetDateTime createdAt, OffsetDateTime updatedAt) {}

    @PostMapping
    public ResponseEntity<ProductResponse> register(@RequestBody @Valid RegisterRequest request) {
        Product product = service.register(mapper.toProduct(request));
        return ResponseEntity.ok(mapper.toResponse(product));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> findById(@PathVariable Long id) {
        var product = service.findById(id);
        var response = mapper.toResponse(product);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> findAll() {
        var products = service.findAll();
        var response = mapper.toResponseList(products);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/page")
    public ResponseEntity<Page<ProductResponse>> findAllPaged(@PageableDefault(size = 20) Pageable pageable) {
        var page = service.findAll(pageable).map(mapper::toResponse);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id, @RequestBody @Valid UpdateRequest request) {
        Product product = service.update(id, mapper.toProduct(request));
        return ResponseEntity.ok(mapper.toResponse(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
