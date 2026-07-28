namespace Blazor_Station_Zero.Components.Models
{
    // Represents a person entity
    public class Person
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";           
        public string Profession { get; set; } = ""; 
        public bool KnowsThisMuchIs { get; set; }
    }
}