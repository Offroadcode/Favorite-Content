using FavoriteContent.Respositories;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Results;
using Umbraco.Web.WebApi;

namespace FavoriteContent.Controllers.Api
{
    public class FavoriteContentController : UmbracoApiController
    {

        private readonly FavoriteContentRepository FavoriteContentRepository = new FavoriteContentRepository();

        [HttpGet]
        public JsonResult<string[]> GetFavoriteProperties()
        {
            var favorites = new string[] { };

            var dbFavorites = FavoriteContentRepository.GetFavoriteProperties();

            favorites = dbFavorites.Select(x => x.PropertyName).ToArray();

            return Json(favorites);
        }

        [HttpGet]
        public bool AddPropertyToFavorites(string property)
        {
            return FavoriteContentRepository.AddFavoriteContent(property);
        }

        [HttpGet]
        public bool RemovePropertyFromFavorites(string property)
        {
            return FavoriteContentRepository.RemoveFavoriteContent(property);
        }
    }
}
