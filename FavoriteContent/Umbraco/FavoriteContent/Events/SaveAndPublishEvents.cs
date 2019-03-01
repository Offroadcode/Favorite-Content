using FavoriteContent.Respositories;
using Umbraco.Core.Events;
using Umbraco.Core.Models;
using Umbraco.Core.Services;

namespace FavoriteContent.Events
{
    public static class SaveAndPublishEvents
    {
        private static readonly FavoriteContentRepository FavoriteContentRepository = new FavoriteContentRepository();

        public static void UpdateFavoritePropertyInDatabase(IContentService sender, SaveEventArgs<IContent> args)
        {
            foreach(var node in args.SavedEntities)
            {
                foreach (var property in node.Properties)
                {
                    if (property.IsDirty())
                    {
                        var favoriteContent = FavoriteContentRepository.UpdateFavoriteContent(property.Alias);
                    }
                }
            }
        }
    }
}
