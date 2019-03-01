using FavoriteContent.Respositories;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Results;
using Umbraco.Web.WebApi;
using FavoriteContent.Models;
using System.Collections.Generic;
using FavoriteContent.Constants;

namespace FavoriteContent.Controllers.Api
{
    public class FavoriteContentController : UmbracoAuthorizedApiController
    {

        private readonly FavoriteContentRepository FavoriteContentRepository = new FavoriteContentRepository();

        [HttpGet]
        public JsonResult<List<FavoriteContentApiModel>> GetFavoriteProperties()
        {
            var favorites = new List<FavoriteContentApiModel>();

            var dbFavorites = FavoriteContentRepository.GetFavoriteProperties();
            var topProperties = FavoriteContentRepository.GetTopProperties();

            favorites = dbFavorites.Select(x => new FavoriteContentApiModel { Name = x.PropertyName, IsFavorite = x.IsFavorite }).ToList();

            if (topProperties.Any())
            {
                var convertedTopProperties = topProperties.Select(x => new FavoriteContentApiModel { Name = x.PropertyName, IsFavorite = x.IsFavorite });
                favorites.AddRange(convertedTopProperties);
            }

            favorites = favorites.Distinct().ToList();

            return Json(favorites, JsonSettings.Settings);
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
