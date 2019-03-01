using System.Web.Http;
using System.Web.Http.Results;
using Umbraco.Web.WebApi;

namespace FavoriteContent.Controllers.Api
{
    public class FavoriteContentController : UmbracoAuthorizedApiController
    {
        [HttpGet]
        public JsonResult<string[]> GetFavoriteProperties()
        {
            var favorites = new string[] { };

            return Json(favorites);
        }

        [HttpGet]
        public bool AddPropertyToFavorites(string property)
        {
            return true;
        }

        [HttpGet]
        public bool RemovePropertyFromFavorites(string property)
        {
            return true;
        }
    }
}
