using Blazor_Station_Zero.Components.Models;

namespace Blazor_Station_Zero.Components.Services
{
    public interface IProductService
    {
        Task<List<Product>> GetProductsAsync();
        Task<Product?> GetProductByIdAsync(int id);
    }

    public class ProductService : IProductService
    {
        // Simulated in-memory data store
        private readonly List<Product> _products = new()
        {
            new Product { Id = 1, Name = "Laptop", Price = 1200.50m },
            new Product { Id = 2, Name = "Mouse", Price = 25.99m },
            new Product { Id = 3, Name = "Keyboard", Price = 45.00m }
        };

        public Task<List<Product>> GetProductsAsync()
        {
            // In a real app, this might call a database or API
            return Task.FromResult(_products);
        }

        public Task<Product?> GetProductByIdAsync(int id)
        {
            var product = _products.FirstOrDefault(p => p.Id == id);
            return Task.FromResult(product);
        }
    }
}