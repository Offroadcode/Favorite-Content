using FavoriteContent.Respositories;
using Umbraco.Core;
using Umbraco.Core.Events;
using Umbraco.Core.Models;
using Umbraco.Core.Services;
using Umbraco.Web;

namespace FavoriteContent.Events
{
    public static class SaveAndPublishEvents
    {
        private static readonly IDataTypeService DataTypeService = ApplicationContext.Current.Services.DataTypeService;
        private static readonly FavoriteContentRepository FavoriteContentRepository = new FavoriteContentRepository();

        public static void UpdateFavoritePropertyInDatabase(IContentService sender, SaveEventArgs<IContent> args)
        {
            foreach(var node in args.SavedEntities)
            {
                foreach (var property in node.Properties)
                {
                    if (property.IsDirty() && property.PropertyType.PropertyEditorAlias != "Umbraco.Grid")
                    {
                        var user = UmbracoContext.Current.Security.CurrentUser;
                        var favoriteContent = FavoriteContentRepository.UpdateFavoriteContent(property.Alias, user.Id);
                    }
                }
            }
        }
    }
}
