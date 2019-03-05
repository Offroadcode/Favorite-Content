using FavoriteContent.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.Persistence;

namespace FavoriteContent.Respositories
{
    public class FavoriteContentRepository
    {
        private readonly UmbracoDatabase db = ApplicationContext.Current.DatabaseContext.Database;

        /// <summary>
        /// Gets the most used properties from the database
        /// </summary>
        /// <param name="count">
        /// How many properties to return (defaults at 5)
        /// </param>
        /// <returns>
        /// A list of top properties that have not been removed from the favorites
        /// </returns>
        public IEnumerable<FavoriteContentModel> GetTopProperties(int userId, int count = 5)
        {
            var topProperties = new List<FavoriteContentModel>();

            var favoritesByUseCount = db.Query<FavoriteContentModel>("SELECT * FROM [FavoriteContent] WHERE IsFavorite IS NULL AND UserId =" + userId + " OR IsFavorite !='False' ORDER BY UseCount DESC");

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
        public IEnumerable<FavoriteContentModel> GetFavoriteProperties(int userId)
        {
            var favoriteProperties = new List<FavoriteContentModel>();

            var favorites = db.Query<FavoriteContentModel>("SELECT * FROM [FavoriteContent] WHERE IsFavorite='TRUE' AND UserId=" + userId + "");

            if (favorites != null && favorites.Any())
            {
                favoriteProperties.AddRange(favorites);
            }

            return favoriteProperties;
        }

        public IEnumerable<FavoriteContentModel> GetAllPropertiesByUser(int userId)
        {
            var userProperties = new List<FavoriteContentModel>();

            var propertiesByUser = db.Query<FavoriteContentModel>("SELECT * FROM [FavoriteContent] WHERE UserId =" + userId + "");

            if(propertiesByUser != null && propertiesByUser.Any())
            {
                userProperties.AddRange(propertiesByUser);
            }

            return userProperties;
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
        public bool AddFavoriteContent(string propertyName, int userId, bool? setFavorite = true)
        {
            var allProperties = GetAllProperties();

            try
            {
                var newFavoriteContent = new FavoriteContentModel
                {
                    IsFavorite = setFavorite,
                    PropertyName = propertyName,
                    UseCount = 1,
                    UserId = userId
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

        public bool UpdateFavoriteContent(string propertyName, int userId)
        {
            var userProperties = GetAllPropertiesByUser(userId);
            
            if (userProperties.Any(x => x.PropertyName == propertyName))
            {
                try
                {
                    var property = userProperties.FirstOrDefault(x => x.PropertyName == propertyName);
                    var useCount = property.UseCount + 1;

                    property.UseCount = useCount;

                    db.Update(property);
                    return true;
                }
                catch (Exception ex)
                {
                    LogHelper.Error<FavoriteContentRepository>("Unable to update property " + propertyName + " in the FavoriteContent database table.", ex);
                    return false;
                }
            }
            else
            {
                return AddFavoriteContent(propertyName, userId, null);
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
        public bool RemoveFavoriteContent(string propertyName, int userId)
        {
            try
            {
                var favorite = GetAllPropertiesByUser(userId).FirstOrDefault();
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
