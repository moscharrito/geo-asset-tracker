using GeoTrack.Api.Data;
using GeoTrack.Api.GraphQL.Types;
using GeoTrack.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configure DbContext with PostgreSQL/PostGIS
builder.Services.AddPooledDbContextFactory<GeoTrackDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions =>
        {
            npgsqlOptions.UseNetTopologySuite();
            npgsqlOptions.MigrationsAssembly("GeoTrack.Api");
        });
});

// Also register DbContext for non-GraphQL use (services, etc.)
builder.Services.AddDbContext<GeoTrackDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions =>
        {
            npgsqlOptions.UseNetTopologySuite();
        });
});

// Register services
builder.Services.AddScoped<IAssetService, AssetService>();

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Hot Chocolate GraphQL
builder.Services
    .AddGraphQLServer()
    .AddQueryType()
    .AddMutationType()
    .AddSubscriptionType()
    .AddTypeExtension<GeoTrack.Api.GraphQL.Queries.AssetQueries>()
    .AddTypeExtension<GeoTrack.Api.GraphQL.Queries.GeoFenceQueries>()
    .AddTypeExtension<GeoTrack.Api.GraphQL.Mutations.AssetMutations>()
    .AddTypeExtension<GeoTrack.Api.GraphQL.Mutations.GeoFenceMutations>()
    .AddTypeExtension<GeoTrack.Api.GraphQL.Subscriptions.AssetSubscriptions>()
    .AddType<AssetType>()
    .AddType<AssetStatusType>()
    .AddType<GeoFenceGraphQLType>()
    .AddType<GeoFenceTypeEnumType>()
    .AddSpatialTypes()
    .AddFiltering()
    .AddSorting()
    .AddInMemorySubscriptions()
    .RegisterDbContextFactory<GeoTrackDbContext>()
    .ModifyRequestOptions(opt => opt.IncludeExceptionDetails = builder.Environment.IsDevelopment());

var app = builder.Build();

// Apply migrations and seed data in development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<GeoTrackDbContext>();

    try
    {
        await context.Database.MigrateAsync();

        var assetService = scope.ServiceProvider.GetRequiredService<IAssetService>();
        await assetService.SeedDemoDataAsync();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Could not apply migrations. Database may not be available yet.");
    }
}

app.UseCors();
app.UseWebSockets();
app.MapGraphQL();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();
