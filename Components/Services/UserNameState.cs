namespace Blazor_Station_Zero.Components.Services
{
    public class UserNameState
    {
        private string _userName = "Default name";

        public string UserName
        {
            get => _userName;
            set
            {
                if (_userName != value)
                {
                    _userName = value;
                    OnChange?.Invoke();
                }
            }
        }

        public event Action? OnChange;
    }
}