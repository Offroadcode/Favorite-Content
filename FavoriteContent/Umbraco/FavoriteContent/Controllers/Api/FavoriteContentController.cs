using FavoriteContent.Respositories;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Results;
using Umbraco.Web.WebApi;
using FavoriteContent.Models;
using System.Collections.Generic;
using FavoriteContent.Constants;
using Umbraco.Core.Services;

namespace FavoriteContent.Controllers.Api
{
    public class FavoriteContentController : UmbracoAuthorizedApiController
    {
        private readonly FavoriteContentRepository FavoriteContentRepository = new FavoriteContentRepository();

        [HttpGet]
        public JsonResult<List<FavoriteContentApiModel>> GetFavoriteProperties()
        {
            var user = UmbracoContext.Security.CurrentUser;
            var favorites = new List<FavoriteContentApiModel>();

            var dbFavorites = FavoriteContentRepository.GetFavoriteProperties(user.Id);
            var topProperties = FavoriteContentRepository.GetTopProperties(user.Id);

            favorites = dbFavorites.Select(x => new FavoriteContentApiModel { Name = x.PropertyName, IsFavorite = x.IsFavorite, SortOrder = x.SortOrder }).ToList();

            if (topProperties.Any())
            {
                var convertedTopProperties = topProperties.Select(x => new FavoriteContentApiModel { Name = x.PropertyName, IsFavorite = x.IsFavorite, SortOrder = x.SortOrder });
                favorites.AddRange(convertedTopProperties);
            }

            favorites = favorites.Distinct().ToList();

            return Json(favorites, JsonSettings.Settings);
        }

        [HttpGet]
        public bool AddPropertyToFavorites(string property)
        {
            var user = UmbracoContext.Security.CurrentUser;
            return FavoriteContentRepository.AddFavoriteContent(property, user.Id);
        }

        [HttpGet]
        public bool UpdatePropertySortOrder(string property, int sortOrder)
        {
            var user = UmbracoContext.Security.CurrentUser;
            return FavoriteContentRepository.UpdateFavoriteContent(property, user.Id, sortOrder);
        }

        [HttpGet]
        public bool RemovePropertyFromFavorites(string property)
        {
            var user = UmbracoContext.Security.CurrentUser;
            return FavoriteContentRepository.RemoveFavoriteContent(property, user.Id);
        }
    }
}
