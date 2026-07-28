using Blazor_Station_Zero.Components.Models;

namespace Blazor_Station_Zero.Components.Services
{
    public interface IPersonService
    {
        Task<List<Person>> GetPeopleAsync();
        Task<Person?> GetPersonByIdAsync(int id);
    }

    public class PersonService : IPersonService
    {
        // Simulated in-memory data store
        private readonly List<Person> _people = new()
        {
           new Person { Id = 1, Name = "First Person", Profession = "Jazz Musician", KnowsThisMuchIs = false},
	new Person { Id = 2, Name = "Second Person", Profession = "Snowman Builder", KnowsThisMuchIs = true},
	new Person { Id = 3, Name = "Third Person", Profession = "Professional Yoyoist", KnowsThisMuchIs = true}
        };

        public Task<List<Person>> GetPeopleAsync()
        {
            // In a real app, this might call a database or API
            return Task.FromResult(_people);
        }

        public Task<Person?> GetPersonByIdAsync(int id)
        {
            var person = _people.FirstOrDefault(p => p.Id == id);
            return Task.FromResult(person);
        }
    }
}