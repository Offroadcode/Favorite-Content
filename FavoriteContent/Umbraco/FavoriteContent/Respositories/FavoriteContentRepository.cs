using FavoriteContent.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Core;
using Umbraco.Core.Logging;

namespace FavoriteContent.Respositories
{
    public class FavoriteContentRepository
    {
        /// <summary>
        /// Gets the most used properties from the database
        /// </summary>
        /// <param name="count">
        /// How many properties to return (defaults at 5)
        /// </param>
        /// <returns>
        /// A list of top properties that have not been removed from the favorites
        /// </returns>
        public IEnumerable<FavoriteContentModel> GetTopProperties(int count = 5)
        {
            var topProperties = new List<FavoriteContentModel>();

            var db = ApplicationContext.Current.DatabaseContext.Database;
            var favoritesByUseCount = db.Query<FavoriteContentModel>("SELECT * FROM [FavoriteContent] WHERE IsFavorite!='FALSE' ORDER BY UseCount DESC");

            if (favoritesByUseCount != null && favoritesByUseCount.Any())
            {
                topProperties.AddRange(favoritesByUseCount.Take(count));
            }

            return topProperties;
        }

        /// <summary>
        /// Gets all favorited properties
        /// </summary>
        /// <returns>
        /// A list of properties that have been specifically favorited
        /// </returns>
        public IEnumerable<FavoriteContentModel> GetFavoriteProperties()
        {
            var favoriteProperties = new List<FavoriteContentModel>();

            var db = ApplicationContext.Current.DatabaseContext.Database;
            var favorites = db.Query<FavoriteContentModel>("SELECT * FROM [FavoriteContent] WHERE IsFavorite='TRUE'");

            if (favorites != null && favorites.Any())
            {
                favoriteProperties.AddRange(favorites);
            }

            return favoriteProperties;
        }

        /// <summary>
        /// Gets all the properties from the database
        /// </summary>
        /// <returns>
        /// All properties, whether they're favorited or not
        /// </returns>
        public IEnumerable<FavoriteContentModel> GetAllProperties()
        {
            var allProperties = new List<FavoriteContentModel>();

            var db = ApplicationContext.Current.DatabaseContext.Database;
            var properties = db.Query<FavoriteContentModel>("SELECT * FROM FavoriteContent");

            if (properties != null && properties.Any())
            {
                allProperties.AddRange(properties);
            }

            return allProperties;
        }

        /// <summary>
        /// Adds a property to the favorites
        /// </summary>
        /// <param name="propertyName">
        /// The name of the property to add
        /// </param>
        /// <returns>
        /// Whether or not the property was successfully added
        /// </returns>
        public bool AddFavoriteContent(string propertyName)
        {
            var db = ApplicationContext.Current.DatabaseContext.Database;
            var allProperties = GetAllProperties();

            // Don't add the property if it's name is already in there
            // (you shouldn't be able to do this anyway, but...
            if (allProperties.Any(x => x.PropertyName == propertyName))
            {
                return false;
            }

            try
            {
                var newFavoriteContent = new FavoriteContentModel
                {
                    IsFavorite = true,
                    PropertyName = propertyName,
                    UseCount = 1
                };

                db.Insert(newFavoriteContent);

                return true;
            }
            catch (Exception ex)
            {
                LogHelper.Error<FavoriteContentRepository>("Unable to add property" + propertyName + "to the FavoriteContent database table.", ex);
                return false;
            }
        }

        /// <summary>
        /// Removes a property from the favorites (but does not delete it from the database)
        /// </summary>
        /// <param name="propertyName">
        /// The name of the property to remove
        /// </param>
        /// <returns>
        /// Whether or not the property was successfully removed
        /// </returns>
        public bool RemoveFavoriteContent(string propertyName)
        {
            var db = ApplicationContext.Current.DatabaseContext.Database;

            try
            {
                var favorite = db.Query<FavoriteContentModel>("SELECT * FROM [FavoriteContent] WHERE PropertyName='" + propertyName + "'").FirstOrDefault();
                if (favorite != null)
                {
                    favorite.IsFavorite = false;

                    db.Update(favorite);
                    return true;
                }
                else
                {
                    LogHelper.Warn<FavoriteContentRepository>("Could not find property named " + propertyName + "in the FavoriteContent database table, so was unable to remove it.");
                    return false;
                }
            }
            catch (Exception ex)
            {
                LogHelper.Error<FavoriteContentRepository>("Unable to set property " + propertyName + " to not a favorite in the FavoriteContent database table.", ex);
                return false;
            }
        }
    }
}
