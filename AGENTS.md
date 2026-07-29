# Blazor Station Zero — Agent Notes

## Blazor interactivity gotchas

### Layouts cannot be interactive components
A layout (`@inherits LayoutComponentBase`) is rendered statically by `RouteView`
and receives `Body` as a `RenderFragment`. You **cannot** put
`@rendermode InteractiveServer` on a layout — it throws:

> Cannot pass the parameter 'Body' to component 'MainLayout' with rendermode
> 'InteractiveServerRenderMode' ... parameter is of the delegate type
> 'RenderFragment', which is arbitrary code and cannot be serialized.

Static parents *can* host interactive children, but the static parent itself
has no live circuit — its `OnInitialized` runs once on the server and event
subscriptions (e.g. `StateHasChanged` on a state container's `OnChange`) never
fire over SignalR.

### Pattern for shared state visible from a static layout
When a page (`@rendermode InteractiveServer`) mutates a scoped state container
and the value must show in the static layout's top bar / nav:

1. The state container exposes an `event Action? OnChange;` invoked from its
   property setter.
2. The page binds to the container normally (`@bind` + `@bind:event="oninput"`).
3. **Do not** subscribe in the layout. Instead, create a small child component
   that is `@rendermode InteractiveServer`, injects the state, subscribes to
   `OnChange` in `OnInitialized`, unsubscribes via `IDisposable`, and renders
   the value. Place that component inside the static layout.

Files demonstrating this:
- `Components/Services/UserNameState.cs` — state container with `OnChange`.
- `Components/Pages/Home.razor` — `@rendermode InteractiveServer`, binds input
  to `UserNameState.UserName`.
- `Components/Layout/UserNameDisplay.razor` — interactive child that subscribes
  and displays the live value.
- `Components/Layout/MainLayout.razor` — static layout hosting
  `<UserNameDisplay />`.

### Pages that need event handling must opt in
A page with no `@rendermode` directive is statically rendered (SSR). `@bind`,
`@onclick`, etc. will render but **won't respond** to input at runtime — the
input shows its initial value and typing does nothing. Add
`@rendermode InteractiveServer` to any page that needs interactivity (see
`Components/Pages/Counter.razor` for the repo's existing convention).