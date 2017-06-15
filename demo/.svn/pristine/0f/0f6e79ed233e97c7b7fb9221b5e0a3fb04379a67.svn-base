/********************************************************************
* @file      : Card.h
* @author    : by wuchengmao
* @date      : 2016/5/3
* @brief     : 扑克牌类，定义扑克牌的数据结构
*********************************************************************/

#ifndef __CARD_H__
#define __CARD_H__


class CCard
{
public:
    enum CardStyle
    {
        StyleNull,
        StyleHeart,
        StyleSpade,
        StyleDiamond,
        StyleClub,
        StyleBlackJoker,
        StyleRedJoker
    };

    enum CardPoint
    {
        PointNull = 0,
        PointA = 1,
        Point2 = 2,
        Point3 = 3,
        Point4 = 4,
        Point5 = 5,
        Point6 = 6,
        Point7 = 7,
        Point8 = 8,
        Point9 = 9,
        Point10 = 10,
        PointJ = 11,
        PointQ = 12,
        PointK = 13,
        PointMax = 13
    };

public:
    inline CCard()
    {
        style = StyleNull;
        point = PointNull;
    }

    inline CCard(CardStyle style, CardPoint point)
    {
        this->style = style;
        this->point = point;
    }

    inline CCard(const CCard& card)
    {
        style = card.style;
        point = card.point;
    }

    inline ~CCard()
    {
    }

    inline CCard& operator=(const CCard& card)
    {
        if (this == &card)
            return *this;

        style = card.style;
        point = card.point;

        return *this;
    }

    inline friend bool operator==(const CCard& lhs, const CCard& rhs)
    {
        return (lhs.style == rhs.style && lhs.point == rhs.point);
    }

    inline friend bool operator!=(const CCard& lhs, const CCard& rhs)
    {
        return !(lhs == rhs);
    }

    inline friend bool operator>(const CCard& lhs, const CCard& rhs)
    {
        if (rhs.style == StyleRedJoker)
        {
            return false;
        }
        else if (rhs.style == StyleBlackJoker)
        {
            return lhs.style == StyleRedJoker;
        }
        else
        {
            if (lhs.style == StyleRedJoker || lhs.style == StyleBlackJoker)
            {
                return true;
            }
            else
            {
                if (lhs.point == 2)
                {
                    return rhs.point != 2;
                }
                else if (lhs.point == 1)
                {
                    return rhs.point != 2 && rhs.point != 1;
                }
                else
                {
                    return rhs.point != 2 && rhs.point != 1 && lhs.point > rhs.point;
                }
            }
        }
    }

    inline friend bool operator<(const CCard& lhs, const CCard& rhs)
    {
        if (lhs.style == StyleRedJoker)
        {
            return false;
        }
        else if (lhs.style == StyleBlackJoker)
        {
            return rhs.style == StyleRedJoker;
        }
        else
        {
            if (rhs.style == StyleRedJoker || rhs.style == StyleBlackJoker)
            {
                return true;
            }
            else
            {
                if (rhs.point == 2)
                {
                    return lhs.point != 2;
                }
                else if (rhs.point == 1)
                {
                    return lhs.point != 2 && lhs.point != 1;
                }
                else
                {
                    return lhs.point != 2 && lhs.point != 1 && lhs.point < rhs.point;
                }
            }
        }
    }

public:
    CardStyle style;
    CardPoint point;
};


#define MAX_CARD_NUM        (54)


#endif //__CARD_H__
