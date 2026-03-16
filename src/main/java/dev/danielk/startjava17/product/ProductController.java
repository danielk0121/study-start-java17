package dev.danielk.startjava17.product;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService service;
    private final ProductMapper mapper;

    public ProductController(ProductService service, ProductMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    public record RegisterRequest(String name, BigDecimal price, int stock, String category) {}
    public record UpdateRequest(String name, BigDecimal price, int stock, String category) {}
    public record ProductResponse(Long id, String name, BigDecimal price, int stock, String category) {}

    @PostMapping
    public ResponseEntity<ProductResponse> register(@RequestBody RegisterRequest request) {
        Product product = service.register(mapper.toProduct(request));
        return ResponseEntity.ok(mapper.toResponse(product));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toResponse(service.findById(id)));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> findAll() {
        return ResponseEntity.ok(mapper.toResponseList(service.findAll()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id, @RequestBody UpdateRequest request) {
        Product product = service.update(id, mapper.toProduct(request));
        return ResponseEntity.ok(mapper.toResponse(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
