using FavoriteContent.Models;
using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.Persistence;
using Umbraco.Core.Services;

namespace FavoriteContent.Events
{
    public class Startup : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            var db = applicationContext.DatabaseContext.Database;
            var creator = new DatabaseSchemaHelper(db, LoggerResolver.Current.Logger, applicationContext.DatabaseContext.SqlSyntax);

            //Ensure the FavoriteContent table exists and if not, create it
            if (!creator.TableExist("FavoriteContent"))
            {
                creator.CreateTable<FavoriteContentModel>(false);
            }

            ContentService.Saving += SaveAndPublishEvents.UpdateFavoritePropertyInDatabase;
        }
    }
}
